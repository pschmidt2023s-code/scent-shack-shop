import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PayPalTest = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCredentials = async () => {
    setLoading(true);
    try {
      
      if (error) {
        setResult({ error: error.message, type: 'error' });
      } else {
        setResult({ data, type: 'success' });
      }
    } catch (err: any) {
      setResult({ error: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const testPayPalPayment = async () => {
    setLoading(true);
    try {
      const testData = {
        order_id: "test-order-123",
        amount: 4.99,
        currency: "EUR",
        order_number: "TEST123",
        customer_email: "test@example.com"
      };

        body: testData
      });
      
      if (error) {
        setResult({ error: error.message, type: 'error' });
      } else {
        setResult({ data, type: 'success' });
      }
    } catch (err: any) {
      setResult({ error: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>PayPal Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={testCredentials}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testing..." : "Test PayPal Credentials"}
            </Button>
            
            <Button 
              onClick={testPayPalPayment}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Testing..." : "Test PayPal Payment Creation"}
            </Button>
          </div>

          {result && (
            <Card className={`mt-4 ${result.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">
                  {result.type === 'error' ? 'Error:' : 'Success:'}
                </h3>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(result.error || result.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalTest;