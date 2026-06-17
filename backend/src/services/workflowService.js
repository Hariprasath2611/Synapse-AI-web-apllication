import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

export const executeWorkflow = async (workflow, io = null) => {
  const { nodes = [], edges = [], id: workflowId } = workflow;
  logger.info(`Starting execution of workflow ${workflowId || 'unknown'}`);

  const executionLogs = [];
  const triggerNode = nodes.find(n => n.type === 'trigger' || n.type === 'webhook' || n.id === 'trigger-1');
  let currentNode = triggerNode || nodes[0];
  
  if (!currentNode) {
    return { success: false, error: 'No start node found in workflow definition.' };
  }

  const broadcastState = (nodeId, status, output = '') => {
    if (io) {
      io.emit('workflow_progress', {
        workflowId,
        nodeId,
        status,
        output,
        timestamp: new Date().toISOString()
      });
    }
  };

  while (currentNode) {
    const nodeId = currentNode.id;
    const nodeName = currentNode.data?.label || currentNode.label || currentNode.type;
    logger.info(`Executing Node ${nodeId} (${nodeName})`);
    
    broadcastState(nodeId, 'running', `Initializing ${nodeName}...`);
    executionLogs.push({ nodeId, nodeName, status: 'running', timestamp: new Date() });
    
    // Simulate node execution delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let output = '';
    switch(currentNode.type) {
      case 'trigger':
      case 'webhook':
        output = 'Webhook payload successfully parsed: { lead_name: "John Doe", email: "john@example.com" }';
        break;
      case 'agent':
        output = 'Synapse Qualification Agent analyzed details: "Lead matches premium enterprise profile. Score: 92/100."';
        break;
      case 'crm':
        output = 'HubSpot records successfully updated: John Doe flagged as "Qualified Lead".';
        break;
      case 'email':
        output = 'Automated introductory message sent to: john@example.com.';
        break;
      case 'notification':
        output = 'Slack notification dispatched to team channel #sales-alerts.';
        break;
      default:
        output = `Completed execution step for node ${nodeName}.`;
    }

    broadcastState(nodeId, 'completed', output);
    const logIndex = executionLogs.findIndex(l => l.nodeId === nodeId);
    if (logIndex !== -1) {
      executionLogs[logIndex].status = 'completed';
      executionLogs[logIndex].output = output;
      executionLogs[logIndex].completedAt = new Date();
    }

    // Find next node via outgoing edges
    const outboundEdge = edges.find(e => e.source === nodeId);
    if (outboundEdge) {
      currentNode = nodes.find(n => n.id === outboundEdge.target);
    } else {
      currentNode = null; // end of workflow
    }
  }

  logger.info(`Workflow ${workflowId} completed successfully.`);
  return { success: true, logs: executionLogs };
};
