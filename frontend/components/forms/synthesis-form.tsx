'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSynthesis } from '@/lib/hooks/use-synthesis';

interface SynthesisFormProps {
  onSuccess?: (requestId: string) => void;
  onSubmitStart?: () => void;
  onError?: () => void;
  className?: string;
}

export function SynthesisForm({ onSuccess, onSubmitStart, onError, className }: SynthesisFormProps) {
  const { formState, updateFormData, submitSynthesis } = useSynthesis();
  const { data, errors, isSubmitting } = formState;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitStart?.();
    const result = await submitSynthesis();
    if (result && onSuccess) {
      onSuccess(result.request_id);
    } else if (!result && onError) {
      onError();
    }
  };

  const handleInputChange = (field: keyof typeof data) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    updateFormData({ [field]: value });
  };

  return (
    <Card className={`${className} bg-transparent border-none shadow-none`}>
      <CardHeader className="text-center space-y-3">
        <CardTitle className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-slate-800">
          Xeno-Synth
        </CardTitle>
        <p className="text-slate-600 text-base md:text-lg font-medium">
          Genetic Modification Analysis Platform
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
          {/* Host Organism Field */}
          <div className="space-y-2">
            <Label htmlFor="host_organism" className="text-sm font-semibold tracking-wide text-gray-800">
              Host Organism
            </Label>
            <Input
              id="host_organism"
              type="text"
              value={data.host_organism}
              onChange={handleInputChange('host_organism')}
              placeholder="e.g., homo_sapiens, mus_musculus"
              className={`bg-white/60 backdrop-blur-sm rounded-lg font-mono text-sm tracking-wide focus:ring-2 focus:ring-blue-400 ${errors.host_organism ? 'border-red-500' : 'border-white/30'}`}
              disabled={isSubmitting}
            />
            {errors.host_organism && (
              <p className="text-sm text-red-600 font-medium">{errors.host_organism}</p>
            )}
          </div>

          {/* Desired Trait Field */}
          <div className="space-y-2">
            <Label htmlFor="desired_trait" className="text-sm font-semibold tracking-wide text-gray-800">
              Desired Trait
            </Label>
            <Input
              id="desired_trait"
              type="text"
              value={data.desired_trait}
              onChange={handleInputChange('desired_trait')}
              placeholder="e.g., high bone density, enhanced muscle growth"
              className={`bg-white/60 backdrop-blur-sm rounded-lg font-mono text-sm tracking-wide focus:ring-2 focus:ring-green-400 ${errors.desired_trait ? 'border-red-500' : 'border-white/30'}`}
              disabled={isSubmitting}
            />
            {errors.desired_trait && (
              <p className="text-sm text-red-600 font-medium">{errors.desired_trait}</p>
            )}
          </div>

          {/* Optimization Options */}
          <div className="space-y-4 bg-white/30 backdrop-blur-sm rounded-xl p-5 border border-white/40 shadow-inner">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase font-display">
              Analysis Options
            </h3>
            
            <div className="flex items-center space-x-2">
              <input
                id="optimize"
                type="checkbox"
                checked={data.optimize}
                onChange={handleInputChange('optimize')}
                disabled={isSubmitting}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="optimize" className="text-sm text-gray-700 font-light tracking-wide">
                Optimize genetic sequence for enhanced expression
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="safety_check"
                type="checkbox"
                checked={data.safety_check}
                onChange={handleInputChange('safety_check')}
                disabled={isSubmitting}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <Label htmlFor="safety_check" className="text-sm text-gray-700 font-light tracking-wide">
                Perform comprehensive safety analysis
              </Label>
            </div>
          </div>

          {/* Error Display */}
          {errors.general && (
            <Alert variant="destructive" className="bg-red-50/80 backdrop-blur-sm border-red-200">
              <AlertDescription className="text-red-800 font-medium tracking-wide">
                {errors.general}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting || !data.host_organism || !data.desired_trait}
            className="w-full bg-science-700 hover:bg-science-800 text-blue font-semibold rounded-lg transition-colors duration-200 py-3"
            size="sm"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4" />
                <span className="font-medium">Processing Analysis...</span>
              </div>
            ) : (
              'Begin Analysis'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
