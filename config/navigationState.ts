// src/config/navigationState.ts

/**
 * Flag global que indica se o usuário está atualmente
 * na página de erro — usada para evitar loops de redirecionamento
 */
export let isOnErrorPage = false;

/**
 * Função que permite atualizar a flag.
 * Exemplo:
 *   setIsOnErrorPage(true)  → ao entrar na página de erro
 *   setIsOnErrorPage(false) → ao sair da página de erro
 */
export function setIsOnErrorPage(value: boolean) {
  isOnErrorPage = value;
}
