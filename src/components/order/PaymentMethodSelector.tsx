'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Shield } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  type: string;
  is_default: boolean;
  icon_url: string;
  config: any;
}

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selected: string;
  onSelect: (methodId: string) => void;
}

export default function PaymentMethodSelector({
  paymentMethods,
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'paypal_business':
      case 'paypal_personal':
        return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'stripe':
        return <CreditCard className="h-5 w-5 text-purple-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPaymentTypeDescription = (type: string) => {
    switch (type) {
      case 'paypal_business':
        return 'Pay securely through PayPal Business';
      case 'paypal_personal':
        return 'Pay via PayPal.me link';
      case 'stripe':
        return 'Pay with credit/debit card via Stripe';
      case 'manual':
        return 'Manual payment processing';
      default:
        return 'Payment processing';
    }
  };

  const getPaymentBadgeVariant = (type: string) => {
    switch (type) {
      case 'paypal_business':
        return 'default';
      case 'paypal_personal':
        return 'secondary';
      case 'stripe':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Payment Method
          <span className="text-destructive">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selected} onValueChange={onSelect} required>
          {paymentMethods.map(method => (
            <div
              key={method.id}
              className="flex items-start space-x-2 p-4 border-2 border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm group"
            >
              <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getPaymentIcon(method.type)}
                  <Label
                    htmlFor={`payment-${method.id}`}
                    className="font-medium cursor-pointer flex-1 text-gray-500 group-hover:text-gray-900"
                  >
                    {method.name}
                  </Label>
                  <div className="flex gap-2">
                    <Badge variant={getPaymentBadgeVariant(method.type)}>
                      {method.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {method.is_default && <Badge variant="default">Recommended</Badge>}
                  </div>
                </div>

                <p className="text-sm text-gray-600 group-hover:text-gray-700 mb-2">
                  {method.description || getPaymentTypeDescription(method.type)}
                </p>

                {/* Payment Method Specific Information */}
                {method.type === 'paypal_business' && (
                  <div className="text-xs text-blue-700 bg-blue-100 p-3 rounded-lg border border-blue-300 font-medium">
                    <p>✓ Secure PayPal checkout</p>
                    <p>✓ Instant payment confirmation</p>
                    <p>✓ Buyer protection included</p>
                  </div>
                )}

                {method.type === 'paypal_personal' && (
                  <div className="text-xs text-gray-700 bg-gray-100 p-3 rounded-lg border border-gray-300 font-medium">
                    <p>• Pay via PayPal.me link</p>
                    <p>• Manual payment verification</p>
                    <p>• Processing may take 1-2 hours</p>
                  </div>
                )}

                {method.type === 'stripe' && (
                  <div className="text-xs text-purple-700 bg-purple-100 p-3 rounded-lg border border-purple-300 font-medium">
                    <p>✓ Credit/Debit cards accepted</p>
                    <p>✓ Secure SSL encryption</p>
                    <p>✓ Instant processing</p>
                  </div>
                )}

                {method.type === 'manual' && (
                  <div className="text-xs text-orange-700 bg-orange-100 p-3 rounded-lg border border-orange-300 font-medium">
                    <p>• Manual payment processing</p>
                    <p>• Contact support for payment instructions</p>
                    <p>• Verification may take additional time</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>

        {paymentMethods.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment methods configured</p>
            <p className="text-sm">Please contact support to complete your order</p>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-100 border-2 border-blue-300 rounded-lg shadow-sm">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-blue-700 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Security & Privacy</p>
              <p>
                All payments are processed securely. We never store your payment information on our
                servers. Your financial data is protected by industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
