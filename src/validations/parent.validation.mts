import * as yup from 'yup';

export const parentValidation = {
  createParent: yup.object({
    name: yup.string()
      .required('Name is required')
      .min(2, 'Name should be at least 2 characters'),
    email: yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    password: yup.string()
      .required('Password is required')
      .min(8, 'Password should be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    phone: yup.string()
      .matches(/^\+?[\d\s-]+$/, 'Invalid phone number'),
    childName: yup.string()
      .required('Child name is required')
      .min(2, 'Child name should be at least 2 characters'),
    childAge: yup.number()
      .required('Child age is required')
      .min(0, 'Age cannot be negative')
      .max(18, 'Age must be 18 or under'),
    permissions: yup.object({
      canView: yup.boolean(),
      canDownload: yup.boolean()
    })
  }),

  updateParent: yup.object({
    name: yup.string()
      .min(2, 'Name should be at least 2 characters'),
    email: yup.string()
      .email('Enter a valid email'),
    password: yup.string()
      .min(8, 'Password should be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    phone: yup.string()
      .matches(/^\+?[\d\s-]+$/, 'Invalid phone number'),
    childName: yup.string()
      .min(2, 'Child name should be at least 2 characters'),
    childAge: yup.number()
      .min(0, 'Age cannot be negative')
      .max(18, 'Age must be 18 or under'),
    permissions: yup.object({
      canView: yup.boolean(),
      canDownload: yup.boolean()
    })
  })
};