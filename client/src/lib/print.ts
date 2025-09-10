import { ReceiptTemplate } from "@/components/printing/print-handler";
import { renderToString } from "react-dom/server";

export interface PrintOptions {
  paperWidth?: number; // in mm
  fontSize?: number;
  lineSpacing?: number;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  taxId?: string;
}

const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: "Nexus Business",
  address: "123 Main Street, City, State 12345",
  phone: "(555) 123-4567",
  email: "info@nexusbusiness.com"
};

const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  paperWidth: 80, // 80mm for thermal printers
  fontSize: 12,
  lineSpacing: 1.2,
  margins: {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5
  }
};

export class PrintService {
  private businessInfo: BusinessInfo;
  private defaultOptions: PrintOptions;

  constructor(businessInfo?: Partial<BusinessInfo>, options?: Partial<PrintOptions>) {
    this.businessInfo = { ...DEFAULT_BUSINESS_INFO, ...businessInfo };
    this.defaultOptions = { ...DEFAULT_PRINT_OPTIONS, ...options };
  }

  private createPrintWindow(): Window | null {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    return printWindow;
  }

  private getReceiptStyles(): string {
    return `
      <style>
        @media print {
          body { 
            margin: 0; 
            padding: 5px;
            font-family: 'Courier New', monospace;
            font-size: ${this.defaultOptions.fontSize}px;
            line-height: ${this.defaultOptions.lineSpacing};
          }
          .no-print { display: none; }
          .page-break { page-break-after: always; }
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: ${this.defaultOptions.fontSize}px;
          line-height: ${this.defaultOptions.lineSpacing};
          margin: 0;
          padding: ${this.defaultOptions.margins?.top}px;
          width: ${this.defaultOptions.paperWidth}mm;
          max-width: ${this.defaultOptions.paperWidth}mm;
        }
        
        .receipt-container {
          width: 100%;
          max-width: ${this.defaultOptions.paperWidth}mm;
        }
        
        .receipt-header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        
        .receipt-header h1 {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: bold;
        }
        
        .receipt-header p {
          margin: 0;
          font-size: 10px;
        }
        
        .receipt-section {
          margin: 10px 0;
        }
        
        .receipt-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          align-items: flex-start;
        }
        
        .item-details {
          flex: 1;
          padding-right: 10px;
        }
        
        .item-name {
          font-weight: bold;
          word-wrap: break-word;
        }
        
        .item-info {
          font-size: 10px;
          color: #666;
        }
        
        .item-price {
          white-space: nowrap;
          text-align: right;
          min-width: 80px;
        }
        
        .receipt-total {
          border-top: 2px dashed #000;
          padding-top: 10px;
          margin-top: 10px;
        }
        
        .total-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }
        
        .total-line.grand-total {
          font-weight: bold;
          font-size: 14px;
          border-top: 1px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }
        
        .receipt-footer {
          text-align: center;
          border-top: 2px dashed #000;
          padding-top: 10px;
          margin-top: 15px;
          font-size: 10px;
        }
        
        .barcode {
          text-align: center;
          font-family: 'Libre Barcode 39', monospace;
          font-size: 24px;
          margin: 10px 0;
        }
        
        .receipt-date {
          font-size: 10px;
          text-align: center;
          margin-bottom: 10px;
        }
        
        .customer-info {
          border: 1px solid #000;
          padding: 5px;
          margin: 10px 0;
          font-size: 10px;
        }
        
        .payment-info {
          margin-top: 10px;
          font-size: 10px;
        }
      </style>
    `;
  }

  public async printReceipt(orderData: any, options?: Partial<PrintOptions>): Promise<void> {
    try {
      const printWindow = this.createPrintWindow();
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      const receiptHtml = this.generateReceiptHtml(orderData);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${orderData.orderNumber || orderData.poNumber}</title>
            <meta charset="UTF-8">
            ${this.getReceiptStyles()}
          </head>
          <body>
            ${receiptHtml}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Close after printing (with a delay for the print dialog)
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 250);
      };
      
    } catch (error) {
      console.error('Print failed:', error);
      throw new Error(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async printPurchaseOrder(poData: any, options?: Partial<PrintOptions>): Promise<void> {
    try {
      const printWindow = this.createPrintWindow();
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      const poHtml = this.generatePurchaseOrderHtml(poData);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Purchase Order - ${poData.poNumber}</title>
            <meta charset="UTF-8">
            ${this.getReceiptStyles()}
          </head>
          <body>
            ${poHtml}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => printWindow.close(), 1000);
        }, 250);
      };
      
    } catch (error) {
      console.error('Print PO failed:', error);
      throw new Error(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async printInvoice(invoiceData: any, options?: Partial<PrintOptions>): Promise<void> {
    // Similar to receipt but with different formatting for invoices
    return this.printReceipt(invoiceData, options);
  }

  private generateReceiptHtml(orderData: any): string {
    const formatCurrency = (amount: string | number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleString();
    };

    return `
      <div class="receipt-container">
        <div class="receipt-header">
          <h1>${this.businessInfo.name}</h1>
          <p>${this.businessInfo.address}</p>
          <p>${this.businessInfo.phone}</p>
          ${this.businessInfo.email ? `<p>${this.businessInfo.email}</p>` : ''}
        </div>
        
        <div class="receipt-date">
          ${formatDate(orderData.createdAt)}
        </div>
        
        <div class="receipt-section">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span><strong>Receipt #:</strong></span>
            <span>${orderData.orderNumber || orderData.id}</span>
          </div>
          ${orderData.customer ? `
            <div class="customer-info">
              <strong>Customer:</strong><br/>
              ${orderData.customer.name}<br/>
              ${orderData.customer.email || ''}<br/>
              ${orderData.customer.phone || ''}
            </div>
          ` : ''}
        </div>
        
        <div class="receipt-section">
          <div style="border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 10px;">
            <strong>ITEMS</strong>
          </div>
          ${orderData.items?.map((item: any) => `
            <div class="receipt-item">
              <div class="item-details">
                <div class="item-name">${item.product?.name || 'Item'}</div>
                <div class="item-info">${item.quantity} x ${formatCurrency(item.price)}</div>
              </div>
              <div class="item-price">${formatCurrency(item.total)}</div>
            </div>
          `).join('') || ''}
        </div>
        
        <div class="receipt-total">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>${formatCurrency(orderData.subtotal)}</span>
          </div>
          ${parseFloat(orderData.discount || '0') > 0 ? `
            <div class="total-line">
              <span>Discount:</span>
              <span>-${formatCurrency(orderData.discount)}</span>
            </div>
          ` : ''}
          ${parseFloat(orderData.tax || '0') > 0 ? `
            <div class="total-line">
              <span>Tax:</span>
              <span>${formatCurrency(orderData.tax)}</span>
            </div>
          ` : ''}
          <div class="total-line grand-total">
            <span>TOTAL:</span>
            <span>${formatCurrency(orderData.total)}</span>
          </div>
        </div>
        
        ${orderData.paymentMethod ? `
          <div class="payment-info">
            <strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}
          </div>
        ` : ''}
        
        <div class="receipt-footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>Visit us again soon</p>
          ${this.businessInfo.website ? `<p>${this.businessInfo.website}</p>` : ''}
        </div>
      </div>
    `;
  }

  private generatePurchaseOrderHtml(poData: any): string {
    const formatCurrency = (amount: string | number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString();
    };

    return `
      <div class="receipt-container">
        <div class="receipt-header">
          <h1>${this.businessInfo.name}</h1>
          <p>${this.businessInfo.address}</p>
          <p>${this.businessInfo.phone}</p>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <h2 style="margin: 0; font-size: 18px;">PURCHASE ORDER</h2>
        </div>
        
        <div class="receipt-section">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span><strong>PO Number:</strong></span>
            <span>${poData.poNumber}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span><strong>Date:</strong></span>
            <span>${formatDate(poData.createdAt)}</span>
          </div>
          ${poData.expectedDate ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span><strong>Expected:</strong></span>
              <span>${formatDate(poData.expectedDate)}</span>
            </div>
          ` : ''}
        </div>
        
        ${poData.vendor ? `
          <div class="customer-info">
            <strong>Vendor:</strong><br/>
            ${poData.vendor.name}<br/>
            ${poData.vendor.email || ''}<br/>
            ${poData.vendor.phone || ''}<br/>
            ${poData.vendor.address || ''}
          </div>
        ` : ''}
        
        <div class="receipt-section">
          <div style="border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 10px;">
            <strong>ITEMS ORDERED</strong>
          </div>
          ${poData.items?.map((item: any) => `
            <div class="receipt-item">
              <div class="item-details">
                <div class="item-name">${item.product?.name || 'Item'}</div>
                <div class="item-info">Qty: ${item.quantity} @ ${formatCurrency(item.cost)} each</div>
              </div>
              <div class="item-price">${formatCurrency(item.total)}</div>
            </div>
          `).join('') || ''}
        </div>
        
        <div class="receipt-total">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>${formatCurrency(poData.subtotal)}</span>
          </div>
          ${parseFloat(poData.tax || '0') > 0 ? `
            <div class="total-line">
              <span>Tax:</span>
              <span>${formatCurrency(poData.tax)}</span>
            </div>
          ` : ''}
          <div class="total-line grand-total">
            <span>TOTAL:</span>
            <span>${formatCurrency(poData.total)}</span>
          </div>
        </div>
        
        <div class="receipt-footer">
          <p><strong>Please confirm receipt of this order</strong></p>
          <p>Questions? Contact us at ${this.businessInfo.phone}</p>
        </div>
      </div>
    `;
  }

  public updateBusinessInfo(info: Partial<BusinessInfo>): void {
    this.businessInfo = { ...this.businessInfo, ...info };
  }

  public updatePrintOptions(options: Partial<PrintOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
}

// Create a default print service instance
const printService = new PrintService();

// Export hook for using print functionality
export function usePrint() {
  return {
    printReceipt: (orderData: any, options?: Partial<PrintOptions>) => 
      printService.printReceipt(orderData, options),
    printPurchaseOrder: (poData: any, options?: Partial<PrintOptions>) => 
      printService.printPurchaseOrder(poData, options),
    printInvoice: (invoiceData: any, options?: Partial<PrintOptions>) => 
      printService.printInvoice(invoiceData, options),
    updateBusinessInfo: (info: Partial<BusinessInfo>) => 
      printService.updateBusinessInfo(info),
    updatePrintOptions: (options: Partial<PrintOptions>) => 
      printService.updatePrintOptions(options),
  };
}

// Export the service for direct use
export { printService };

// Helper function to test print functionality
export function testPrint(): void {
  const testData = {
    orderNumber: 'TEST-001',
    createdAt: new Date().toISOString(),
    subtotal: '25.00',
    tax: '2.50',
    total: '27.50',
    items: [
      {
        product: { name: 'Test Product' },
        quantity: 1,
        price: '25.00',
        total: '25.00'
      }
    ]
  };

  printService.printReceipt(testData);
}
