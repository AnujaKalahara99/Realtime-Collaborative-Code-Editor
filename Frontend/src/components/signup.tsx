// import React, { useState } from 'react';
// import { supabase } from '../superbase';

// const Signup: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (error) return setError(error.message);

//     // Insert profile
//     if (data.user) {
//       await supabase.from('profiles').insert({
//         id: data.user.id,
//         full_name: fullName,
//       });
//     }
//   };

//   return (
//     <div className="p-6 max-w-md mx-auto">
//       <h2 className="text-xl font-bold mb-4">Signup</h2>
//       <form onSubmit={handleSignup} className="space-y-4">
//         <input
//           type="text"
//           placeholder="Full Name"
//           value={fullName}
//           onChange={(e) => setFullName(e.target.value)}
//           className="w-full p-2 border rounded"
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full p-2 border rounded"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-2 border rounded"
//         />
//         {error && <p className="text-red-600">{error}</p>}
//         <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
//           Signup
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Signup;
import React, { useState } from 'react';
import { supabase } from '../superbase';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) return setError(signUpError.message);

    if (data.user) {
      const { id } = data.user;

      // Upsert profile into `profiles` table
      const { error: profileError } = await supabase.from('profiles').upsert({
        id,
        full_name: fullName,
        email,
        avatar_url: null, // You can fetch this later if needed
      });

      if (profileError) {
        return setError(`Sign up succeeded but failed to save profile: ${profileError.message}`);
      }

      setSuccess(true);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Signup</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Signup successful! Please check your email to verify.</p>}
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;