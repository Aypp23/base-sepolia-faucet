// This is a placeholder for the API endpoint
// For production, you should deploy the backend separately on a platform like Railway, Render, or Heroku
// and update the frontend API calls to point to that URL

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This is a placeholder response
  // In production, this should connect to your actual backend
  res.status(200).json({
    success: false,
    error: 'Backend not deployed. Please deploy the backend separately and update the API endpoint.'
  });
} 