import { useState, ChangeEvent, FormEvent } from 'react';
import type { CSSProperties, Dispatch, SetStateAction } from 'react';

const token = "Bearer <token>"

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

interface PasswordCheck {
  test: (pwd: string) => boolean;
  error: string;
}

interface BackendError {
  [key: number]: string
}

interface BackendResponse {
  error: string,
  status: boolean
}

interface SubmitUserDetailsPayload {
  username: string;
  password: string;
}

const passwordChecks: PasswordCheck[] = [
  {
    test: (pwd: string) => pwd.length >= 10,
    error: "Password must be at least 10 characters long",
  },
  {
    test: (pwd: string) => pwd.length <= 24,
    error: "Password must be at most 24 characters long",
  },
  {
    test: (pwd: string) => !/\s/.test(pwd),
    error: "Password cannot contain spaces",
  },
  {
    test: (pwd: string) => /\d/.test(pwd),
    error: "Password must contain at least one number",
  },
  {
    test: (pwd: string) => /[A-Z]/.test(pwd),
    error: "Password must contain at least one uppercase letter",
  },
  {
    test: (pwd: string) => /[a-z]/.test(pwd),
    error: "Password must contain at least one lowercase letter",
  },
];

function validatePassword(pwd: string): string[] {
  return passwordChecks
    .filter(check => !check.test(pwd))
    .map(check => check.error);
}

const BACKEND_ERROR_MAP: BackendError = {
  401: 'Not authenticated to access this resource.',
  403: 'Not authenticated to access this resource.',
  422: 'Sorry, the entered password is not allowed, please try a different one.',
  500: 'Something went wrong, please try again.'
}

const submitUserDetails = async (payload: SubmitUserDetailsPayload): Promise<BackendResponse> => {
  try {
    const response = await fetch('<api-end-point>', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(payload),
    });
    debugger;
    if (response.ok) {
      return { status: true, error: '' };
    } else {
      return { status: false, error: BACKEND_ERROR_MAP[response.status] || "Something went wrong, please try again." };
    }
  } catch (error) {
    return { status: false, error: "Something went wrong, please try again." };
  }
}

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientErrors, setClientErrors] = useState<string[]>([]);

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setServerError('');
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    const errors = validatePassword(pwd);
    setClientErrors(errors);
    setServerError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');

    if (username.trim() === '' || clientErrors.length > 0) {
      return;
    }

    setIsSubmitting(true);
    const { status, error } = await submitUserDetails({ username, password });

    if (status) {
      setUserWasCreated(status);
    }
    setServerError(error);
    setIsSubmitting(false);
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit}>
        {serverError && <div style={serverErrorStyle}>{serverError}</div>}

        <label htmlFor="username" style={formLabel}>Username</label>
        <input
          id="username"
          value={username}
          style={formInput}
          aria-label="Username"
          onChange={handleUsernameChange}
        />

        <label htmlFor="password" style={formLabel}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          style={formInput}
          aria-label="Password"
          onChange={handlePasswordChange}
        />

        {clientErrors.length > 0 && (
          <ul style={passwordErrorStyle}>
            {clientErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          style={formButton}
          disabled={isSubmitting || username.trim() === '' || clientErrors.length > 0}
        >
          {isSubmitting ? 'Submitting...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

const serverErrorStyle: CSSProperties = {
  color: 'red',
  marginBottom: '8px',
};

const passwordErrorStyle: CSSProperties = {
  color: 'red',
  margin: '0',
  paddingLeft: '20px'
};