export const paceTools = [
  {
    functionDeclarations: [
      {
        name: 'reduce_hvac_power',
        description: 'Trigger a command to lower HVAC power in a specific stadium sector to save energy.',
        parameters: {
          type: 'object',
          properties: {
            sector_id: { type: 'string', description: "The sector ID, e.g., 'S4'" },
            reduction_percentage: { type: 'number', description: 'Percentage to reduce power by 10-50.' }
          },
          required: ['sector_id', 'reduction_percentage']
        }
      },
      {
        name: 'dispatch_redirect_alert',
        description: 'Send an alert to staff to redirect fans from a high-density sector to a low-density sector.',
        parameters: {
          type: 'object',
          properties: {
            from_sector: { type: 'string' },
            to_sector: { type: 'string' },
            reason: { type: 'string' }
          },
          required: ['from_sector', 'to_sector', 'reason']
        }
      }
    ]
  }
] as const;
