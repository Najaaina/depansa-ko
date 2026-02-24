// hooks/useFormValidation.ts
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

  /**
   * Valide un champ individuel en parsant le schema entier avec
   * les valeurs courantes + la nouvelle valeur du champ modifié.
   * Cela permet aux refine() cross-fields (ex: password === confirmPassword)
   * de fonctionner correctement lors de la validation à la volée.
   */
  const validateField = useCallback(
    (name: string, value: string): string | null => {
      // Construire les valeurs courantes en remplaçant le champ modifié
      const currentValues: Record<string, any> = {};
      Object.keys(fields).forEach((key) => {
        currentValues[key] = key === name ? value : fields[key].value;
      });

      try {
        schema.parse(currentValues);
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // On cherche uniquement l'erreur appartenant au champ concerné
          const fieldError = error.issues.find(
            (issue) => issue.path[0] === name
          );
          return fieldError?.message || null;
        }
        return "Validation error";
      }
    },
    [schema, fields]
  );

  /**
   * Met à jour la valeur d'un champ et valide immédiatement.
   * L'erreur n'est visible que si le champ a déjà été touché (touched),
   * pour ne pas afficher des erreurs avant que l'utilisateur ait interagi.
   */
  const setFieldValue = useCallback(
    (name: string, value: string) => {
      const error = validateField(name, value);
      setFields((prev) => ({
        ...prev,
        [name]: {
          value,
          // On n'affiche l'erreur que si le champ a déjà été touché
          error: prev[name]?.touched ? error : null,
          touched: prev[name]?.touched || false,
        },
      }));
    },
    [validateField]
  );

  /**
   * Marque un champ comme touché (au onBlur) et déclenche sa validation.
   * C'est à ce moment que les erreurs deviennent visibles pour la première fois.
   */
  const setFieldTouched = useCallback(
    (name: string) => {
      setFields((prev) => {
        if (!prev[name]) return prev;

        const error = validateField(name, prev[name].value);

        return {
          ...prev,
          [name]: {
            ...prev[name],
            touched: true,
            error,
          },
        };
      });
    },
    [validateField]
  );

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

  /**
   * Valide tous les champs d'un coup (appelé au submit).
   * Marque tous les champs comme touched et affiche toutes les erreurs.
   */
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
        const newFields = { ...fields };

        // D'abord, on marque tous les champs comme touched
        Object.keys(newFields).forEach((key) => {
          newFields[key] = {
            ...newFields[key],
            touched: true,
            error: null, // reset avant de repeupler
          };
        });

        // Ensuite, on applique les erreurs retournées par Zod
        error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as string;
          if (newFields[fieldName] && !newFields[fieldName].error) {
            // On ne garde que la première erreur par champ
            newFields[fieldName] = {
              ...newFields[fieldName],
              error: issue.message,
            };
          }
        });

        setFields(newFields);
      }
      return false;
    }
  }, [fields, schema]);

  /**
   * Vérifie si le formulaire est valide sans modifier l'état.
   * Utilisé pour activer/désactiver le bouton de submit.
   */
  const isFormValid = useCallback((): boolean => {
    const values: Record<string, any> = {};
    Object.keys(fields).forEach((key) => {
      values[key] = fields[key].value;
    });

    try {
      schema.parse(values);
      return true;
    } catch {
      return false;
    }
  }, [fields, schema]);

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