const {supabaseAdmin, createUserClient} = require('../config/supabase');

async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ error: 'No token' });

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || data.user.user_metadata.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  req.user = data.user;
  next();
}

const  requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = data.user; // 👈 user available in routes
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};



module.exports = {requireAdmin, requireAuth}