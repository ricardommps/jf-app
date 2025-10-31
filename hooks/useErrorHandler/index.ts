import { useSession } from "@/contexts/Authentication";

interface ErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  request?: any;
  message?: string;
}

interface UseErrorHandlerOptions {
  showToast?: boolean; // Mantido para compatibilidade, mas não usado
  autoLogout?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { showToast = true, autoLogout = true } = options;
  const { signOut } = useSession();

  const getErrorMessage = (error: ErrorResponse | null): string => {
    if (!error) return "Erro desconhecido";

    if (error.response?.status) {
      const status = error.response.status;
      const serverMessage =
        error.response.data?.message || error.response.data?.error;

      switch (status) {
        case 400:
          return serverMessage || "Dados inválidos.";
        case 401:
          return "Sessão expirada. Faça login novamente.";
        case 403:
          return "Acesso negado.";
        case 404:
          return "Recurso não encontrado.";
        case 422:
          return serverMessage || "Dados de entrada inválidos.";
        case 429:
          return "Muitas tentativas. Tente novamente em alguns minutos.";
        case 500:
          return "Erro interno do servidor.";
        case 502:
          return "Serviço temporariamente indisponível.";
        case 503:
          return "Serviço em manutenção.";
        default:
          return serverMessage || "Erro do servidor.";
      }
    } else if (error.request) {
      return "Erro de conexão. Verifique sua internet.";
    } else {
      return error.message || "Erro inesperado.";
    }
  };

  const handleError = (
    error: ErrorResponse | null,
    customMessage?: string
  ): string | void => {
    if (!error) return;

    const message = customMessage || getErrorMessage(error);
    const status = error.response?.status;

    // Logout automático em erros de autenticação
    if (status === 401 || status === 403) {
      if (autoLogout) {
        signOut();
      }
    }

    if (__DEV__) {
      console.error("Error handled:", {
        status,
        message,
        error: error.response?.data || error.message,
      });
    }

    return message;
  };

  const handleAsyncError = async (
    asyncFn: () => Promise<any>,
    customMessage?: string
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      const message = handleError(error as ErrorResponse, customMessage);
      throw new Error(String(message));
    }
  };

  const getErrorStatus = (error: ErrorResponse | null): number | null => {
    return error?.response?.status || null;
  };

  const isNetworkError = (error: ErrorResponse | null): boolean => {
    return !!error?.request && !error?.response;
  };

  const isServerError = (error: ErrorResponse | null): boolean => {
    const status = error?.response?.status;
    return status ? status >= 500 : false;
  };

  const isClientError = (error: ErrorResponse | null): boolean => {
    const status = error?.response?.status;
    return status ? status >= 400 && status < 500 : false;
  };

  const isAuthError = (error: ErrorResponse | null): boolean => {
    const status = error?.response?.status;
    return status === 401 || status === 403;
  };

  return {
    handleError,
    handleAsyncError,
    getErrorMessage,
    getErrorStatus,
    isNetworkError,
    isServerError,
    isClientError,
    isAuthError,
  };
};

// Hook para React Query
export const useQueryErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const errorHandler = useErrorHandler(options);

  const onError = (error: ErrorResponse) => {
    errorHandler.handleError(error);
  };

  return {
    ...errorHandler,
    onError,
  };
};

// Hook para formulários
export const useFormErrorHandler = () => {
  const errorHandler = useErrorHandler({ showToast: false });

  const getFieldErrors = (
    error: ErrorResponse | null
  ): Record<string, string> => {
    if (!error?.response?.data) return {};

    const data = error.response.data as any;

    // Suporte ao formato Laravel (PHP)
    if (data.errors) {
      const fieldErrors: Record<string, string> = {};
      Object.keys(data.errors).forEach((field) => {
        fieldErrors[field] = Array.isArray(data.errors[field])
          ? data.errors[field][0]
          : data.errors[field];
      });
      return fieldErrors;
    }

    return {};
  };

  return {
    ...errorHandler,
    getFieldErrors,
  };
};
