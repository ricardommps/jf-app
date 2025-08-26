import { Invoice, InvoiceData } from "@/types/invoice";
import { ProfileType } from "@/types/ProfileType";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

async function loadAssetAsBase64(module: number) {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();

  // Se já for file:// podemos ler direto
  if (asset.localUri && asset.localUri.startsWith("file://")) {
    return await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  // Caso seja asset:// ou outro esquema, copiamos para o cache
  const destPath = FileSystem.cacheDirectory + asset.name;
  await FileSystem.copyAsync({
    from: asset.uri,
    to: destPath,
  });

  return await FileSystem.readAsStringAsync(destPath, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function gerarTemplateHtml(
  invoice: Invoice,
  profile: ProfileType | null
): Promise<string> {
  let logoDataUri_ = "";

  try {
    const logoBase64 = await loadAssetAsBase64(
      require("@/assets/images/jf_logo_full.png")
    );
    logoDataUri_ = `data:image/png;base64,${logoBase64}`;
  } catch (error) {
    console.error("Erro ao carregar logo em Base64:", error);
  }

  const getStatus = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Atrasado";
      case "draft":
        return "Rascunho";
      default:
        return "-";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Fatura ${invoice.invoiceNumber}</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body { 
          font-family: 'Roboto', 'Arial', sans-serif; 
          font-size: 9px;
          line-height: 1.4;
          background-color: #FFFFFF;
          color: #000;
          text-transform: capitalize;
          padding: 20px 24px 60px 24px;
        }
        
        .page {
          max-width: 595px; /* A4 width */
          margin: 0 auto;
          position: relative;
          min-height: calc(100vh - 80px);
        }
        
        /* Typography classes matching PDF styles */
        .h3 { font-size: 16px; font-weight: 700; }
        .h4 { font-size: 13px; font-weight: 700; }
        .body1 { font-size: 10px; }
        .body2 { font-size: 9px; }
        .email { font-size: 9px; text-transform: lowercase; }
        .subtitle1 { font-size: 10px; font-weight: 700; }
        .subtitle2 { font-size: 9px; font-weight: 700; }
        
        /* Margin classes */
        .mb4 { margin-bottom: 3px; }
        .mb8 { margin-bottom: 6px; }
        .mb40 { margin-bottom: 20px; }
        .mr8 { margin-right: 8px; }
        
        /* Layout classes */
        .col4 { width: 25%; }
        .col6 { width: 50%; }
        .col8 { width: 75%; }
        .alignRight { text-align: right; }
        
        .gridContainer {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
        
        /* Header section */
        .header-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        
        .header-right {
          display: flex;
          align-items: flex-end;
          flex-direction: column;
        }
        
        /* Table styles */
        .table {
          display: flex;
          width: 100%;
          flex-direction: column;
        }
        
        .tableRow {
          padding: 4px 0;
          display: flex;
          flex-direction: row;
          border-bottom: 1px solid #DFE3E8;
        }
        
        .noBorder {
          padding-top: 4px;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .tableCell_1 { width: 5%; }
        .tableCell_2 { width: 50%; padding-right: 16px; }
        .tableCell_3 { width: 15%; }
        
        /* Footer */
        .footer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 15px 24px;
          margin: auto;
          border-top: 1px solid #DFE3E8;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          background-color: #FFFFFF;
          max-width: 595px;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* Print styles */
        @media print {
          body { 
            margin: 0; 
            padding: 20px 24px 60px 24px;
            font-size: 8px;
          }
          .page { 
            max-width: none; 
            margin: 0;
            min-height: auto;
          }
          .mb40 { margin-bottom: 15px; }
          .tableRow { padding: 3px 0; }
          .footer { 
            padding: 10px 24px;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-width: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header with logo and status -->
        <div class="gridContainer mb40">
          <div>
            ${
              logoDataUri_
                ? `<img src="${logoDataUri_}" class="header-logo" alt="Logo" />`
                : ""
            }
          </div>
          <div class="header-right">
            <div class="h3">${getStatus(invoice.status)}</div>
            <div>${invoice.invoiceNumber}</div>
          </div>
        </div>

        <!-- From/To section -->
        <div class="gridContainer mb40">
          <div class="col6">
            <div class="subtitle2 mb4">De</div>
            <div class="body2">Joana Foltz Müller</div>
            <div class="body2">(48)99805-8840</div>
            <div class="email">j.oomuller@hotmail.com</div>
          </div>
          <div class="col6">
            <div class="subtitle2 mb4">Para</div>
            <div class="body2">${profile?.name}</div>
            <div class="email">${profile?.email || "-"}</div>
            <div class="body2">${profile?.phone || "-"}</div>
          </div>
        </div>

        <!-- Dates section -->
        <div class="gridContainer mb40">
          <div class="col6">
            <div class="subtitle2 mb4">Date da fatura</div>
            <div class="body2">${formatDate(invoice.createdAt)}</div>
          </div>
          <div class="col6">
            <div class="subtitle2 mb4">Data de vencimento</div>
            <div class="body2">${formatDate(invoice.dueDate)}</div>
          </div>
        </div>

        <!-- Invoice details title -->
        <div class="subtitle1 mb8">Detalhes da fatura</div>

        <!-- Table -->
        <div class="table">
          <!-- Table header -->
          <div class="tableRow">
            <div class="tableCell_1">
              <span class="subtitle2">#</span>
            </div>
            <div class="tableCell_2">
              <span class="subtitle2">Descrição</span>
            </div>
            <div class="tableCell_3">
              <span class="subtitle2">Quant.</span>
            </div>
            <div class="tableCell_3">
              <span class="subtitle2">Preço unitário</span>
            </div>
            <div class="tableCell_3 alignRight">
              <span class="subtitle2">Total</span>
            </div>
          </div>

          <!-- Table row with data -->
          <div class="tableRow">
            <div class="tableCell_1">
              <span>1</span>
            </div>
            <div class="tableCell_2">
              <span class="subtitle2">${invoice.description}</span>
            </div>
            <div class="tableCell_3">
              <span>1</span>
            </div>
            <div class="tableCell_3">
              <span>${invoice.totalAmount}</span>
            </div>
            <div class="tableCell_3 alignRight">
              <span>${invoice.totalAmount}</span>
            </div>
          </div>

          <!-- Empty rows (matching PDF structure - reduced) -->
          <div class="tableRow noBorder">
            <div class="tableCell_1"></div>
            <div class="tableCell_2"></div>
            <div class="tableCell_3"></div>
            <div class="tableCell_3"></div>
            <div class="tableCell_3 alignRight"></div>
          </div>

          <div class="tableRow noBorder">
            <div class="tableCell_1"></div>
            <div class="tableCell_2"></div>
            <div class="tableCell_3"></div>
            <div class="tableCell_3"></div>
            <div class="tableCell_3 alignRight"></div>
          </div>

          <!-- Total row -->
          <div class="tableRow noBorder">
            <div class="tableCell_1"></div>
            <div class="tableCell_2"></div>
            <div class="tableCell_3"></div>
            <div class="tableCell_3">
              <span class="h4">Total</span>
            </div>
            <div class="tableCell_3 alignRight">
              <span class="h4">${invoice.totalAmount}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="col8">
            <div class="subtitle2"></div>
            <div></div>
          </div>
          <div class="col4 alignRight">
            <div class="subtitle2">Dúvidas?</div>
            <div>(48)99805-8840</div>
          </div>
        </div>
      </div>
    </body>
  </html>
`;
}
