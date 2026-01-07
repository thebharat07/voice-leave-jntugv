const { supabaseAdmin } = require('../config/supabase');

async function createUserAsAdmin(payload) {
  const {
    name,
    email,
    password,
    role,
    department,
    title,
    phone,
    level,
  } = payload;

  // 1️⃣ Create auth user
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        "role":role,
        "name": name,
        "title": title,
        "dept": department,
        "level": level
        
      },
    });

  if (authError) {
    throw new Error(authError.message);
  }

  const userId = authUser.user.id;


  // 3️⃣ Insert into public.users table
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .insert({
      uid: userId,
      name: name,
      email,
      role,
      dept: department,
      title,
      phone,
      level: level,
    });

  if (dbError) {
    // rollback auth user if db insert fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(dbError.message);
  }

  return {
    id: userId,
    email,
    role,
  };
}



module.exports = {
  createUserAsAdmin,
};
