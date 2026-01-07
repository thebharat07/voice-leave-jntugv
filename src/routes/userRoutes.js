const express = require('express');
const router = express.Router();
const {uploadAudioAndGetSAS, generateReadSAS} = require('../services/azure');
const crypto = require('crypto');
const multer = require('multer');
const {requireAuth} = require('../middleware/middleware');
const { supabaseAdmin } = require('../config/supabase');

const upload = multer(); // memory storage


router.post(
  '/upload-audio',
  requireAuth,
  upload.single('file'),
  async (req, res) => {
    try {
      const file = req.file;
      const { leave_type } = req.body; // 1. Extract leave_type from the request body

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (!leave_type) {
        return res.status(400).json({ message: 'Leave type is required' });
      }

      const ext = file.originalname.split('.').pop();
      const blobName = `${req.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      // 2. Upload to Storage (Azure/Other)
      const sasUrl = await uploadAudioAndGetSAS(
        file.buffer,
        `leave-applications/${blobName}`,
        file.mimetype
      );

      const ROLE_LEVEL_MAP = {
        'faculty': 1,
        'hod': 2,
        'dean': 3,
        'principal': 4
      };


      // 3. Insert record into Supabase 'leave_applications' table
      // Note: Ensure you have your supabase client initialized (e.g., const supabase = createClient(...))
      const { error: dbError } = await supabaseAdmin
        .from('leave_applications')
        .insert([
          {
            faculty_id: req.user.id,     // From requireAuth middleware
            voice_blob_name: blobName,   // The unique path in storage
            leave_type: leave_type,
            current_level: ROLE_LEVEL_MAP[req.user.user_metadata.role] + 1      // 'Casual', 'Medical', etc.
          },
        ]);

      if (dbError) {
        console.error('Database insertion error:', dbError);
        // You might want to delete the uploaded blob here if the DB fails to keep them in sync
        return res.status(500).json({ message: 'Failed to save application record' });
      }

      // 4. Return success
      res.json({ 
        message: 'Leave application submitted successfully',
        sasUrl 
      });

    } catch (err) {
      console.error('Upload Process Error:', err);
      res.status(500).json({ message: 'Upload failed' });
    }
  }
);

router.post('/get-sas-url', requireAuth, async (req, res) => {
  try {
    const { blobName } = req.body;
    
    // You should verify if the blobName belongs to the user 
    // by checking the database first for security!

    // Generate a fresh SAS URL (e.g., valid for 10 minutes)
    const sasUrl = await generateReadSAS(`leave-applications/${blobName}`); 
    
    res.json({ sasUrl });
  } catch (err) {
    res.status(500).json({ message: 'Error generating URL' + err.message
     });
  }
});


module.exports = router;
