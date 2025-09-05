'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import DateTimePicker from '@/components/ui/datetime-picker';
import FileUpload from '@/components/ui/file-upload';

interface FormField {
  name: string;
  label: string;
  type: string;
  description: string;
  required: boolean;
  config: any;
  options: Array<{
    value: string;
    text: string;
    description: string;
    price_multiplier: number;
    price_addition: number;
  }>;
}

interface PricingTier {
  id: string;
  name: string;
  description: string;
  base_price_per_page: number;
  minimum_price: number;
}

interface FormRendererProps {
  fields: FormField[];
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  pricingTiers: PricingTier[];
  selectedPricingTier: string;
  onPricingTierChange: (tierid: string) => void;
  deadline: string;
  onDeadlineChange: (deadline: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  validationErrors?: Record<string, string>;
  touchedFields?: Record<string, boolean>;
  onFieldTouch?: (fieldName: string) => void;
}

export default function FormRenderer({
  fields,
  formData,
  onChange,
  pricingTiers,
  selectedPricingTier,
  onPricingTierChange,
  deadline,
  onDeadlineChange,
  files,
  onFilesChange,
  validationErrors = {},
  touchedFields = {},
  onFieldTouch = () => {},
}: FormRendererProps) {
  const handleFieldChange = (fieldName: string, value: any) => {
    const newData = { ...formData, [fieldName]: value };
    onChange(newData);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const hasError = touchedFields[field.name] && validationErrors[field.name];

    const handleFieldBlur = () => {
      onFieldTouch(field.name);
    };

    const fieldClasses = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';

    switch (field.type) {
      case 'text':
        return (
          <div>
            <Input
              type="text"
              value={value}
              onChange={e => handleFieldChange(field.name, e.target.value)}
              onBlur={handleFieldBlur}
              placeholder={field.config?.placeholder || ''}
              required={field.required}
              className={fieldClasses}
            />
            {hasError && (
              <p className="text-sm text-red-600 mt-1">{validationErrors[field.name]}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={e => handleFieldChange(field.name, parseInt(e.target.value) || 0)}
            min={field.config?.min || 0}
            max={field.config?.max || undefined}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            placeholder={field.config?.placeholder || ''}
            rows={field.config?.rows || 4}
            required={field.required}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={selectedValue => handleFieldChange(field.name, selectedValue)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.config?.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.text}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    )}
                    {(option.price_multiplier !== 1 || option.price_addition !== 0) && (
                      <span className="text-xs text-green-600">
                        {option.price_multiplier !== 1 && `×${option.price_multiplier}`}
                        {option.price_addition !== 0 && ` +$${option.price_addition}`}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={selectedValue => handleFieldChange(field.name, selectedValue)}
            required={field.required}
          >
            {field.options.map(option => (
              <Label
                key={option.value}
                htmlFor={`${field.name}-${option.value}`}
                className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 ${
                  value === option.value
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:shadow-sm'
                }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`${field.name}-${option.value}`}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{option.text}</div>
                  {option.description && (
                    <p className="text-sm text-gray-700 mt-1">{option.description}</p>
                  )}
                  {(option.price_multiplier !== 1 || option.price_addition !== 0) && (
                    <div className="mt-2 flex gap-2">
                      {option.price_multiplier !== 1 && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          ×{option.price_multiplier}
                        </span>
                      )}
                      {option.price_addition !== 0 && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          +${option.price_addition}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Label>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options.map(option => {
              const isChecked = Array.isArray(value) ? value.includes(option.value) : false;
              return (
                <Label
                  key={option.value}
                  htmlFor={`${field.name}-${option.value}`}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-green-50 hover:border-green-300 ${
                    isChecked
                      ? 'bg-green-50 border-green-400 ring-2 ring-green-200'
                      : 'border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <Checkbox
                    id={`${field.name}-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={checked => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        handleFieldChange(field.name, [...currentValues, option.value]);
                      } else {
                        handleFieldChange(
                          field.name,
                          currentValues.filter((v: string) => v !== option.value)
                        );
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{option.text}</div>
                    {option.description && (
                      <p className="text-sm text-gray-700 mt-1">{option.description}</p>
                    )}
                    {(option.price_multiplier !== 1 || option.price_addition !== 0) && (
                      <div className="mt-2 flex gap-2">
                        {option.price_multiplier !== 1 && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            ×{option.price_multiplier}
                          </span>
                        )}
                        {option.price_addition !== 0 && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            +${option.price_addition}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Label>
              );
            })}
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={e => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Pricing Tier Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Level</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedPricingTier} onValueChange={onPricingTierChange} required>
            {pricingTiers.map(tier => (
              <Label
                key={tier.id}
                htmlFor={`tier-${tier.id}`}
                className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 ${
                  selectedPricingTier === tier.id
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:shadow-sm'
                }`}
              >
                <RadioGroupItem value={tier.id} id={`tier-${tier.id}`} className="mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-500">{tier.name}</div>
                  <p className="text-sm text-gray-700 mt-1">{tier.description}</p>
                  <div className="mt-2">
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                      ${tier.base_price_per_page}/page • Min: ${tier.minimum_price}
                    </span>
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Dynamic Form Fields */}
      {fields.map(field => (
        <Card key={field.name}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </CardTitle>
            {field.description && <p className="text-sm text-gray-700">{field.description}</p>}
          </CardHeader>
          <CardContent>{renderField(field)}</CardContent>
        </Card>
      ))}

      {/* Deadline Selection */}
      <DateTimePicker
        value={deadline}
        onChange={onDeadlineChange}
        minDate={new Date(Date.now() + 60 * 60 * 1000)} // 1 hour from now
        required
        label="Deadline"
        description="Select when you need your order completed. Earlier deadlines may incur additional costs."
      />

      {/* File Upload */}
      <FileUpload
        files={files}
        onFilesChange={onFilesChange}
        maxFileSize={10} // 10MB
        maxTotalSize={50} // 50MB
        maxFiles={5}
        acceptedTypes={[
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/zip',
          'application/x-rar-compressed',
        ]}
        required={false}
        label="Additional Files"
        description="Upload any additional files that will help us complete your order (e.g., instructions, source materials, templates). All files are optional."
      />
    </div>
  );
}
