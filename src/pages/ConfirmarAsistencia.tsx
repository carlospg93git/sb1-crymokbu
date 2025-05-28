import React from 'react';
import { Users } from 'lucide-react';
import { useFormularioConfirmacion } from '../hooks/useFormularioConfirmacion';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';

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

const renderField = (campo: any, values: any, arrayHelpers?: any) => {
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
                className="accent-nature-600 w-5 h-5 rounded border-gray-300"
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nature-600 mb-4"></div>
        <span className="text-nature-600">Cargando...</span>
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
        <Users className="text-nature-600 w-8 h-8" />
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
        onSubmit={values => {
          // Aquí irá la lógica de envío al Worker
          alert(JSON.stringify(values, null, 2));
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
                      {arrayHelpers => renderField(campo, values, arrayHelpers)}
                    </FieldArray>
                  ) : (
                    renderField(campo, values)
                  )}
                  <ErrorMessage name={campo.nombre_interno} component="div" className="text-red-500 text-sm mt-1" />
                </div>
              ))}
            </div>
            <button type="submit" className="w-full bg-nature-600 text-white py-2 rounded-lg font-bold hover:bg-nature-700 transition">Enviar confirmación</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ConfirmarAsistencia; 