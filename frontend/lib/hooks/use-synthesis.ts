import { useState, useCallback } from 'react';
import { synthesisAPI } from '../api/synthesis-api';
import { SynthesisRequest, SynthesisResponse, FormState, FormErrors } from '../types';

export function useSynthesis() {
  const [formState, setFormState] = useState<FormState>({
    data: {
      host_organism: 'homo_sapiens',
      desired_trait: '',
      optimize: true,
      safety_check: true,
    },
    errors: {},
    isSubmitting: false,
  });

  const [result, setResult] = useState<SynthesisResponse | null>(null);

  const validateForm = useCallback((data: SynthesisRequest): FormErrors => {
    const errors: FormErrors = {};

    if (!data.host_organism.trim()) {
      errors.host_organism = 'Host organism is required';
    }

    if (!data.desired_trait.trim()) {
      errors.desired_trait = 'Desired trait is required';
    } else if (data.desired_trait.length < 3) {
      errors.desired_trait = 'Desired trait must be at least 3 characters';
    }

    return errors;
  }, []);

  const updateFormData = useCallback((updates: Partial<SynthesisRequest>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates },
      errors: {}, // Clear errors when data changes
    }));
  }, []);

  const submitSynthesis = useCallback(async () => {
    const errors = validateForm(formState.data);
    
    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({ ...prev, errors }));
      return null;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      // Add a minimum delay to show loading state but keep it shorter for better UX
      const [response] = await Promise.all([
        synthesisAPI.submitSynthesis(formState.data),
        new Promise(resolve => setTimeout(resolve, 1000)) // Reduced from 2000ms to 1000ms
      ]);
      
      setResult(response);
      return response;
    } catch (error) {
      // Since we now always return demo data from the API, this shouldn't happen
      // But keeping for safety
      console.error('Unexpected error in synthesis hook:', error);
      
      setFormState(prev => ({
        ...prev,
        errors: { general: 'Demo mode active - using sample data' }
      }));
      return null;
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.data, validateForm]);

  const resetForm = useCallback(() => {
    setFormState({
      data: {
        host_organism: 'homo_sapiens',
        desired_trait: '',
        optimize: true,
        safety_check: true,
      },
      errors: {},
      isSubmitting: false,
    });
    setResult(null);
  }, []);

  return {
    formState,
    result,
    updateFormData,
    submitSynthesis,
    resetForm,
  };
}
