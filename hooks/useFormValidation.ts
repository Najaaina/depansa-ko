import { useState, useCallback } from "react";
import { z, ZodType } from "zod";

interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
}

interface UseFormValidationOptions<T extends Record<string, any>> {
  schema: ZodType<T>;
  initialValues?: Partial<T>;
}

export const useFormValidation = <T extends Record<string, any>>({
  schema,
  initialValues = {},
}: UseFormValidationOptions<T>) => {
  const [fields, setFields] = useState<Record<string, FieldState>>(() => {
    const initial: Record<string, FieldState> = {};
    Object.keys(initialValues).forEach((key) => {
      initial[key] = {
        value: (initialValues as any)[key] || "",
        error: null,
        touched: false,
      };
    });
    return initial;
  });

  const validateField = useCallback(
    (name: string, value: string): string | null => {
      try {
        // Get the shape of the schemas to validate individual fields
        const schemaShape = (schema as any)._def.shape?.();

        if (!schemaShape || !schemaShape[name]) {
          return null;
        }

        // Validate the individual field
        schemaShape[name].parse(value);
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.issues[0]?.message || "Invalid value";
        }
        return "Validation error";
      }
    },
    [schema],
  );

  const setFieldValue = useCallback(
    (name: string, value: string) => {
      const error = validateField(name, value);
      setFields((prev) => ({
        ...prev,
        [name]: {
          value,
          error,
          touched: prev[name]?.touched || false,
        },
      }));
    },
    [validateField],
  );

  const setFieldTouched = useCallback((name: string) => {
    setFields((prev) => {
      if (!prev[name]) return prev;

      return {
        ...prev,
        [name]: {
          ...prev[name],
          touched: true,
        },
      };
    });
  }, []);

  const setFieldError = useCallback((name: string, error: string | null) => {
    setFields((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        error,
      },
    }));
  }, []);

  const resetFields = useCallback(() => {
    const resetState: Record<string, FieldState> = {};
    Object.keys(initialValues).forEach((key) => {
      resetState[key] = {
        value: (initialValues as any)[key] || "",
        error: null,
        touched: false,
      };
    });
    setFields(resetState);
  }, [initialValues]);

  const validateForm = useCallback((): boolean => {
    const values: Record<string, any> = {};
    Object.keys(fields).forEach((key) => {
      values[key] = fields[key].value;
    });

    try {
      schema.parse(values);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Update all field errors
        const newFields = { ...fields };
        error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as string;
          if (newFields[fieldName]) {
            newFields[fieldName] = {
              ...newFields[fieldName],
              error: issue.message,
              touched: true,
            };
          }
        });
        setFields(newFields);
      }
      return false;
    }
  }, [fields, schema]);

  const isFormValid = useCallback((): boolean => {
    return Object.values(fields).every((field) => !field.error && field.value);
  }, [fields]);

  const getValues = useCallback((): Partial<T> => {
    const values: Record<string, any> = {};
    Object.keys(fields).forEach((key) => {
      values[key] = fields[key].value;
    });
    return values as Partial<T>;
  }, [fields]);

  return {
    fields,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetFields,
    validateForm,
    isFormValid,
    getValues,
  };
};
