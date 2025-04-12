export const serverOrigin = ENV === 'local' ? 'http://localhost:3000' : `http://${VM_IP_ADDRESS}:3000`
