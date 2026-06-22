# Forms - Formularios y Validaciones

## Visión General

Sistema de formularios unificado para el CRM con validaciones consistentes.

---

## Componentes de Form

### Field Components

```jsx
// Field base con label, input y error
<FormField label="Nombre" error={errors.name}>
  <Input
    value={values.name}
    onChange={(e) => setFieldValue('name', e.target.value)}
    onBlur={() => setFieldTouched('name')}
  />
</FormField>

// Select con opciones
<SelectField
  label="Etapa"
  options={stageOptions}
  value={values.stage}
  onChange={(value) => setFieldValue('stage', value)}
/>

// Textarea
<TextareaField
  label="Descripción"
  rows={4}
  value={values.description}
  onChange={(value) => setFieldValue('description', value)}
/>

// Date picker
<DateField
  label="Fecha de cierre"
  value={values.closeDate}
  onChange={(value) => setFieldValue('closeDate', value)}
/>

// Chip input (para tags, emails múltiples)
<ChipInputField
  label="Etiquetas"
  value={values.tags}
  onChange={(tags) => setFieldValue('tags', tags)}
/>
```

---

## Validaciones

### Rules Comunes

| Campo | Reglas |
|-------|--------|
| Email | required, email格式 |
| Nombre | required, min 2 chars |
| Teléfono | optional, formato válido |
| Valor | required, número positivo |
| Fecha | required, fecha válida |
| URL | optional, url格式 |
| Descripción | optional, max 1000 chars |

### Validation Schema

```javascript
const contactSchema = {
  name: {
    required: true,
    minLength: 2,
    message: 'El nombre debe tener al menos 2 caracteres'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Ingresa un email válido'
  },
  phone: {
    pattern: /^\+?[\d\s-]{10,}$/,
    message: 'Teléfono inválido'
  }
};

const dealSchema = {
  title: {
    required: true,
    minLength: 3,
    message: 'El título debe tener al menos 3 caracteres'
  },
  value: {
    required: true,
    min: 0,
    message: 'El valor debe ser mayor a 0'
  },
  stage: {
    required: true,
    message: 'Selecciona una etapa'
  },
  expectedCloseDate: {
    required: true,
    future: true,
    message: 'La fecha debe ser futura'
  }
};
```

### Validate Function

```javascript
const validate = (schema, values) => {
  const errors = {};

  Object.keys(schema).forEach(field => {
    const rules = schema[field];
    const value = values[field];

    if (rules.required && !value) {
      errors[field] = rules.message || 'Campo requerido';
      return;
    }

    if (value) {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = rules.message;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = rules.message;
      }
      if (rules.min && value < rules.min) {
        errors[field] = rules.message;
      }
    }
  });

  return errors;
};
```

---

## Form Hook

```javascript
const useForm = (initialValues, schema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setFieldValue = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const setFieldTouched = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (field) => {
    const fieldSchema = schema[field];
    if (!fieldSchema) return;

    const error = validateFieldSingle(fieldSchema, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (onSubmit) => {
    const allErrors = validate(schema, values);
    setErrors(allErrors);

    const hasErrors = Object.keys(allErrors).length > 0;
    if (!hasErrors) {
      onSubmit(values);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateField,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};
```

---

## Formularios del CRM

### Nuevo Contacto

```
- Nombre (required)
- Email (required, email)
- Teléfono (optional)
- Empresa (required)
- Cargo (optional)
- LinkedIn (optional, URL)
- País (select)
- Ciudad (optional)
- Fuente (select)
- Responsable (select)
- Etiquetas (chip input)
- Notas (textarea)
```

### Nueva Oportunidad

```
- Empresa (required)
- Contacto principal (select)
- Valor (required, number)
- Etapa (select)
- Probabilidad (slider 0-100)
- Fecha de cierre (date)
- Fuente (select)
- Responsable (select)
- Tags (chip input)
- Notas (textarea)
```

### Nueva Tarea

```
- Título (required)
- Descripción (textarea)
- Tipo (select: call/meeting/email/task)
- Prioridad (select: alta/media/baja)
- Fecha de vencimiento (date)
- Hora (time, optional)
- Asignado a (select)
- Relacionado a (select: contact/deal, optional)
```

### Nuevo Producto

```
- Nombre (required)
- Descripción (textarea)
- Categoría (select)
- Tipo (radio: producto/servicio/suscripción)
- Precio (number)
- Moneda (select)
- Impuesto incluido (checkbox)
- Descuento % (number, optional)
- Período de facturación (select, si suscripción)
- Estado (toggle: active/inactive)
- Tags (chip input)
- Notas internas (textarea)
```

---

## UX de Forms

### Debounce

- Input de búsqueda: 300ms debounce
- Validación en blur (al perder foco)
- No validar en cada keystroke

### Feedback

- Error shown below input
- Error border color: #DC2626
- Success state: green border
- Loading state en submit

### Guardar cambios

- Confirmar antes de salir si hay cambios sin guardar
- Auto-save drafts cada 30s (donde aplica)

---

## Notas

- Validación manual (no usar librerías)
- Todos los forms siguen el mismo patrón
- Guardar drafts en localStorage