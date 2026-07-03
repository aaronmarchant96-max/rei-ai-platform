import 'dotenv/config';
import express from 'express';
import cfaiHandler from './api/cfai.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * Main REI API endpoint following Fortis et Liber:
 * 1. Surface Area - Single well-defined interface
 * 2. Solvency - Clean error handling
 * 3. Enumeration - Logs all decision paths 
 */
/**
 * REI Core API Endpoint - Fortis et Liber Implementation:
 * 
 * 1. Surface Area - Single unified interface for:
 *    - Routing decisions
 *    - Model execution
 *    - Error handling
 * 
 * 2. Solvency - Guaranteed completion via:
 *    - Structured error responses
 *    - Fallback content generation
 *    - Clean state maintenance
 * 
 * 3. Enumeration - Explicit tracking of:
 *    - All decision paths
 *    - Model metadata
 *    - Performance characteristics
 * 
 * 4. Conservation - Minimal overhead:
 *    - Lean middleware
 *    - Direct error propagation
 *    - No redundant processing
 */
app.post('/api/cfai', async (req, res) => {
  try {
    const mockRes = {
      setHeader: (name, value) => res.setHeader(name, value),
      status: (code) => {
        res.status(code);
        return mockRes;
      },
      json: (data) => {
        res.json(data);
        return mockRes;
      }
    };
    await cfaiHandler(req, mockRes);
  } catch (error) {
    console.error('API Error Stack Trace:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Try: curl -X POST http://localhost:${PORT}/api/cfai -H "Content-Type: application/json" -d '{"command":"help"}'`);
});
