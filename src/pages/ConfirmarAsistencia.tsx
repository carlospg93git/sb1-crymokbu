import React from 'react';
import { Users } from 'lucide-react';
import { useFormularioConfirmacion } from '../hooks/useFormularioConfirmacion';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import { useConfigSections } from '../hooks/useConfigSections';
import { useBranding } from '../hooks/useBranding';

const initialValuesFromCampos = (campos: any[]) => {
  const values: Record<string, any> = {};
  campos.forEach(campo => {
    if (campo.tipo_de_campo === 'Personas adicionales (repetible)') {
      values[campo.nombre_interno] = [];
    } else if (campo.tipo_de_campo === 'Booleano (checkbox/switch)') {
      values[campo.nombre_interno] = false;
    } else {
      values[campo.nombre_interno] = '';
    }
  });
  return values;
};

const getValidation = (campo: any) => {
  if (!campo.obligatorio) return undefined;
  return (value: any) => {
    if (campo.tipo_de_campo === 'Booleano (checkbox/switch)') {
      if (!value) return 'Campo obligatorio';
    } else {
      if (!value || (typeof value === 'string' && value.trim() === '')) return 'Campo obligatorio';
    }
    return undefined;
  };
};

const renderField = (campo: any, values: any, arrayHelpers?: any, colorPrincipal?: string) => {
  switch (campo.tipo_de_campo) {
    case 'Texto corto (input)':
    case 'Email':
    case 'Teléfono':
      return (
        <Field
          name={campo.nombre_interno}
          type={campo.tipo_de_campo === 'Email' ? 'email' : campo.tipo_de_campo === 'Teléfono' ? 'tel' : 'text'}
          placeholder={campo.placeholder}
          className="w-full border rounded p-2"
          validate={getValidation(campo)}
        />
      );
    case 'Área de texto (textarea)':
      return (
        <Field
          as="textarea"
          name={campo.nombre_interno}
          placeholder={campo.placeholder}
          className="w-full border rounded p-2"
          validate={getValidation(campo)}
        />
      );
    case 'Booleano (checkbox/switch)':
      return (
        <Field as="select" name={campo.nombre_interno} className="w-32 border rounded p-2" validate={getValidation(campo)}>
          <option value="">Selecciona</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </Field>
      );
    case 'Selección simple (dropdown)':
      return (
        <Field as="select" name={campo.nombre_interno} className="w-full border rounded p-2" validate={getValidation(campo)}>
          <option value="">Selecciona una opción</option>
          {campo.opciones?.map((op: string, idx: number) => (
            <option key={idx} value={op}>{op}</option>
          ))}
        </Field>
      );
    case 'Selección múltiple (checkbox group)':
      return (
        <div className="flex flex-col gap-2">
          {campo.opciones?.map((op: string, idx: number) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-50 transition">
              <Field
                type="checkbox"
                name={campo.nombre_interno}
                value={op}
                className="w-5 h-5 rounded border-gray-300"
                style={{ accentColor: colorPrincipal }}
              />
              <span className="text-base">{op}</span>
            </label>
          ))}
        </div>
      );
    case 'Personas adicionales (repetible)':
      return arrayHelpers ? (
        <div>
          {values[campo.nombre_interno] && values[campo.nombre_interno].length > 0 && (
            values[campo.nombre_interno].map((_: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Field
                  name={`${campo.nombre_interno}[${idx}]`}
                  placeholder={`Nombre de la persona ${idx + 1}`}
                  className="w-full border rounded p-2"
                />
                <button type="button" onClick={() => arrayHelpers.remove(idx)} className="text-red-500">Eliminar</button>
              </div>
            ))
          )}
          <button type="button" onClick={() => arrayHelpers.push('')} className="mt-2 text-blue-600">Añadir persona</button>
        </div>
      ) : null;
    default:
      return null;
  }
};

const ConfirmarAsistencia = () => {
  const { campos, imagenIntro, introduccion, loading, error } = useFormularioConfirmacion();
  const { event_code } = useConfigSections();
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const { branding } = useBranding();
  const colorPrincipal = branding?.color_principal || '#457945';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{ borderColor: colorPrincipal }}></div>
        <span style={{ color: colorPrincipal }}>Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-red-600">{error}</span>
      </div>
    );
  }

  if (!campos.length) return null;

  return (
    <div className="p-4 max-w-md mx-auto pb-16">
      <div className="flex items-center justify-center mb-6">
        <Users style={{ color: colorPrincipal }} className="w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">Confirmar asistencia</h1>
      </div>
      {imagenIntro && (
        <div className="flex justify-center mb-4">
          <img
            src={imagenIntro}
            alt="Imagen de introducción"
            className="rounded-2xl max-w-xs w-full object-cover shadow"
            style={{ maxHeight: 200 }}
          />
        </div>
      )}
      {introduccion && (
        <div
          className="prose prose-nature mb-6 text-center"
          dangerouslySetInnerHTML={{ __html: introduccion }}
        />
      )}
      <Formik
        initialValues={initialValuesFromCampos(campos)}
        onSubmit={async (values, { resetForm }) => {
          setSubmitStatus('loading');
          try {
            // Convertir strings 'true'/'false' a booleanos reales para los campos booleanos
            const valuesToSend = { ...values };
            campos.forEach(campo => {
              if (campo.tipo_de_campo === 'Booleano (checkbox/switch)') {
                if (valuesToSend[campo.nombre_interno] === 'true') valuesToSend[campo.nombre_interno] = true;
                else if (valuesToSend[campo.nombre_interno] === 'false') valuesToSend[campo.nombre_interno] = false;
              }
            });
            const res = await fetch('https://worker-orsoie-d1.carlospg93.workers.dev/api/rsvp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...valuesToSend, event_code }),
            });
            if (res.ok) {
              setSubmitStatus('success');
              resetForm();
            } else {
              setSubmitStatus('error');
            }
          } catch (e) {
            setSubmitStatus('error');
          }
        }}
      >
        {({ values }) => (
          <Form className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow space-y-6">
              {campos.map((campo, idx) => (
                <div key={campo.nombre_interno}>
                  <label className="block text-xl font-semibold mb-2">
                    {campo.etiqueta}
                    {campo.obligatorio && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {campo.tipo_de_campo === 'Personas adicionales (repetible)' ? (
                    <FieldArray name={campo.nombre_interno}>
                      {arrayHelpers => renderField(campo, values, arrayHelpers, colorPrincipal)}
                    </FieldArray>
                  ) : (
                    renderField(campo, values, undefined, colorPrincipal)
                  )}
                  <ErrorMessage name={campo.nombre_interno} component="div" className="text-red-500 text-sm mt-1" />
                </div>
              ))}
            </div>
            <button type="submit" className="w-full text-white py-2 rounded-lg font-bold transition" style={{ background: colorPrincipal }} disabled={submitStatus === 'loading'}>
              {submitStatus === 'loading' ? 'Enviando...' : 'Enviar confirmación'}
            </button>
            {submitStatus === 'success' && (
              <div className="text-center font-semibold mt-2" style={{ color: colorPrincipal }}>¡Confirmación enviada correctamente!</div>
            )}
            {submitStatus === 'error' && (
              <div className="text-red-600 text-center font-semibold mt-2">Error al enviar la confirmación. Inténtalo de nuevo.</div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ConfirmarAsistencia; 