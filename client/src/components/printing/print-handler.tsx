import { useRef } from 'react';

interface PrintHandlerProps {
  children: React.ReactNode;
  className?: string;
}

export function PrintHandler({ children, className }: PrintHandlerProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.4;
                  margin: 0;
                  padding: 10px;
                }
                .receipt-header {
                  text-align: center;
                  border-bottom: 2px dashed #000;
                  padding-bottom: 10px;
                  margin-bottom: 10px;
                }
                .receipt-item {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 5px;
                }
                .receipt-total {
                  border-top: 2px dashed #000;
                  padding-top: 10px;
                  margin-top: 10px;
                  font-weight: bold;
                }
                .receipt-footer {
                  text-align: center;
                  border-top: 2px dashed #000;
                  padding-top: 10px;
                  margin-top: 10px;
                }
                @media print {
                  body { margin: 0; padding: 5px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  return (
    <div>
      <div ref={printRef} className={className}>
        {children}
      </div>
      <button onClick={handlePrint} className="no-print">
        Print
      </button>
    </div>
  );
}

export function ReceiptTemplate({ 
  orderData, 
  businessInfo = {
    name: "Nexus Business",
    address: "123 Main Street",
    phone: "(555) 123-4567"
  }
}: { 
  orderData: any;
  businessInfo?: {
    name: string;
    address: string;
    phone: string;
  };
}) {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  return (
    <div style={{ width: '300px', fontFamily: 'monospace', fontSize: '12px' }}>
      <div className="receipt-header">
        <h2 style={{ margin: '0 0 5px 0' }}>{businessInfo.name}</h2>
        <p style={{ margin: '0', fontSize: '10px' }}>{businessInfo.address}</p>
        <p style={{ margin: '0', fontSize: '10px' }}>{businessInfo.phone}</p>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <p style={{ margin: '0' }}>Receipt #: {orderData.orderNumber || orderData.poNumber}</p>
        <p style={{ margin: '0' }}>Date: {new Date(orderData.createdAt).toLocaleString()}</p>
        {orderData.customer && (
          <p style={{ margin: '0' }}>Customer: {orderData.customer.name}</p>
        )}
      </div>
      
      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '10px 0' }}>
        {orderData.items?.map((item: any, index: number) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.product?.name || 'Item'}</span>
              <span>{formatCurrency(item.total)}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              {item.quantity} x {formatCurrency(item.price)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="receipt-total">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(orderData.subtotal)}</span>
        </div>
        {parseFloat(orderData.discount || '0') > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>Discount:</span>
            <span>-{formatCurrency(orderData.discount)}</span>
          </div>
        )}
        {parseFloat(orderData.tax || '0') > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>Tax:</span>
            <span>{formatCurrency(orderData.tax)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(orderData.total)}</span>
        </div>
      </div>
      
      <div className="receipt-footer">
        <p style={{ margin: '0', fontSize: '10px' }}>Thank you for your business!</p>
        <p style={{ margin: '0', fontSize: '10px' }}>Visit us again soon</p>
      </div>
    </div>
  );
}
