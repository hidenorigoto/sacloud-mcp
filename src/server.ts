#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import https from 'https';

const SACLOUD_API_TOKEN = process.env.SACLOUD_API_TOKEN || '';
const SACLOUD_API_SECRET = process.env.SACLOUD_API_SECRET || '';

// Default zone to use if not specified
const DEFAULT_ZONE = 'tk1v';

// Helper function to make API calls to Sakura Cloud
async function fetchFromSakuraCloud(path: string, isPublicAPI: boolean = false, zone: string = DEFAULT_ZONE, method: string = 'GET', bodyData?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const basePath = isPublicAPI ? '/cloud/api/cloud/1.1' : `/cloud/zone/${zone}/api/cloud/1.1`;
    
    const options = {
      hostname: 'secure.sakura.ad.jp',
      port: 443,
      path: `${basePath}${path}`,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Authorization': '',
        'Content-Type': 'application/json'
      }
    };
    
    // Add authorization for non-public APIs
    if (!isPublicAPI) {
      options.headers['Authorization'] = `Basic ${Buffer.from(`${SACLOUD_API_TOKEN}:${SACLOUD_API_SECRET}`).toString('base64')}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (data) {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } else {
            resolve({});
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (bodyData && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(bodyData));
    }
    
    req.end();
  });
}

// Helper function to fetch data from AppRun API
async function fetchFromAppRunAPI(path: string, method: string = 'GET', bodyData?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    validateCredentials();
    
    const options = {
      hostname: 'secure.sakura.ad.jp',
      port: 443,
      path: `/cloud/api/apprun/1.0/apprun/api${path}`,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${SACLOUD_API_TOKEN}:${SACLOUD_API_SECRET}`).toString('base64')}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (data) {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } else {
            resolve({});
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (bodyData && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(bodyData));
    }
    
    req.end();
  });
}

// Check if API credentials are provided
function validateCredentials(): void {
  if (!SACLOUD_API_TOKEN || !SACLOUD_API_SECRET) {
    throw new Error('Missing API credentials. Set SACLOUD_API_TOKEN and SACLOUD_API_SECRET environment variables.');
  }
}

// Initialize MCP server
const server = new Server(
  {
    name: 'sacloud-mcp-server',
    version: '1.0.0',
    port: 3001
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Register resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'sakura:///servers',
        name: 'Sakura Cloud Servers',
        description: 'List of all servers in Sakura Cloud'
      },
      {
        uri: 'sakura:///switches',
        name: 'Sakura Cloud Switches',
        description: 'List of all switches in Sakura Cloud'
      },
      {
        uri: 'sakura:///appliances',
        name: 'Sakura Cloud Appliances',
        description: 'List of all appliances in Sakura Cloud'
      },
      {
        uri: 'sakura:///disks',
        name: 'Sakura Cloud Disks',
        description: 'List of all disks in Sakura Cloud'
      },
      {
        uri: 'sakura:///archives',
        name: 'Sakura Cloud Archives',
        description: 'List of all archives in Sakura Cloud'
      },
      {
        uri: 'sakura:///cdrom',
        name: 'Sakura Cloud ISO Images',
        description: 'List of all ISO images (CD-ROMs) in Sakura Cloud'
      },
      {
        uri: 'sakura:///bridge',
        name: 'Sakura Cloud Bridges',
        description: 'List of all bridges in Sakura Cloud'
      },
      {
        uri: 'sakura:///internet',
        name: 'Sakura Cloud Routers',
        description: 'List of all routers in Sakura Cloud'
      },
      {
        uri: 'sakura:///interface',
        name: 'Sakura Cloud Interfaces',
        description: 'List of all network interfaces in Sakura Cloud'
      },
      {
        uri: 'sakura:///icon',
        name: 'Sakura Cloud Icons',
        description: 'List of all icons in Sakura Cloud'
      },
      {
        uri: 'sakura:///note',
        name: 'Sakura Cloud Notes',
        description: 'List of all startup scripts and notes in Sakura Cloud'
      },
      {
        uri: 'sakura:///sshkey',
        name: 'Sakura Cloud SSH Keys',
        description: 'List of all SSH keys in Sakura Cloud'
      },
      {
        uri: 'sakura:///region',
        name: 'Sakura Cloud Regions',
        description: 'List of all regions in Sakura Cloud'
      },
      {
        uri: 'sakura:///zone',
        name: 'Sakura Cloud Zones',
        description: 'List of all zones in Sakura Cloud'
      },
      {
        uri: 'sakura:///product',
        name: 'Sakura Cloud Products',
        description: 'List of all available products in Sakura Cloud'
      },
      {
        uri: 'sakura:///commonserviceitem',
        name: 'Sakura Cloud Common Service Items',
        description: 'List of all common service items (DNS, Simple Monitor, etc.) in Sakura Cloud'
      },
      {
        uri: 'sakura:///license',
        name: 'Sakura Cloud Licenses',
        description: 'List of all licenses in Sakura Cloud'
      },
      {
        uri: 'sakura:///auth-status',
        name: 'Sakura Cloud Authentication Status',
        description: 'Current authentication status and permissions'
      },
      {
        uri: 'sakura:///bill',
        name: 'Sakura Cloud Billing Information',
        description: 'Monthly billing information'
      },
      {
        uri: 'sakura:///bill-detail',
        name: 'Sakura Cloud Billing Details',
        description: 'Detailed breakdown of billing information'
      },
      {
        uri: 'sakura:///coupon',
        name: 'Sakura Cloud Coupons',
        description: 'List of all available coupons'
      },
      {
        uri: 'sakura:///privatehost',
        name: 'Sakura Cloud Private Hosts',
        description: 'List of all private hosts in Sakura Cloud'
      },
      {
        uri: 'sakura:///public-price',
        name: 'Sakura Cloud Public Price List',
        description: 'Public pricing information for Sakura Cloud services'
      },
      {
        uri: 'sakura:///apprun',
        name: 'Sakura Cloud AppRun',
        description: 'List of all AppRun applications in Sakura Cloud'
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  // Parse the URI to extract zone information if present
  // Format: sakura:///resource?zone=zoneName
  let zone = DEFAULT_ZONE;
  const uriParts = uri.split('?');
  const resourcePath = uriParts[0];
  
  if (uriParts.length > 1) {
    const queryParams = new URLSearchParams(uriParts[1]);
    if (queryParams.has('zone')) {
      zone = queryParams.get('zone') || DEFAULT_ZONE;
    }
  }
  
  if (resourcePath === 'sakura:///servers') {
    try {
      validateCredentials();
      const serversData = await fetchFromSakuraCloud('/server', false, zone);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(serversData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching servers:', error);
      throw error;
    }
  } else if (resourcePath === 'sakura:///switches') {
    try {
      validateCredentials();
      const switchesData = await fetchFromSakuraCloud('/switch', false, zone);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(switchesData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching switches:', error);
      throw error;
    }
  } else if (resourcePath === 'sakura:///appliances') {
    try {
      validateCredentials();
      const appliancesData = await fetchFromSakuraCloud('/appliance', false, zone);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(appliancesData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching appliances:', error);
      throw error;
    }
  } else if (resourcePath === 'sakura:///disks') {
    try {
      validateCredentials();
      const disksData = await fetchFromSakuraCloud('/disk', false, zone);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(disksData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching disks:', error);
      throw error;
    }
  } else if (resourcePath === 'sakura:///archives') {
    try {
      validateCredentials();
      const archivesData = await fetchFromSakuraCloud('/archive', false, zone);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(archivesData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching archives:', error);
      throw error;
    }
  } else if (resourcePath === 'sakura:///cdrom') {
    try {
      validateCredentials();
      const cdromData = await fetchFromSakuraCloud('/cdrom', false, zone);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(cdromData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching ISO images:', error);
      throw error;
    }
  } else if (uri === 'sakura:///bridge') {
    try {
      validateCredentials();
      const bridgeData = await fetchFromSakuraCloud('/bridge');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(bridgeData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching bridges:', error);
      throw error;
    }
  } else if (uri === 'sakura:///internet') {
    try {
      validateCredentials();
      const routerData = await fetchFromSakuraCloud('/internet');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(routerData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching routers:', error);
      throw error;
    }
  } else if (uri === 'sakura:///interface') {
    try {
      validateCredentials();
      const interfaceData = await fetchFromSakuraCloud('/interface');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(interfaceData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching interfaces:', error);
      throw error;
    }
  } else if (uri === 'sakura:///icon') {
    try {
      validateCredentials();
      const iconData = await fetchFromSakuraCloud('/icon');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(iconData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching icons:', error);
      throw error;
    }
  } else if (uri === 'sakura:///note') {
    try {
      validateCredentials();
      const noteData = await fetchFromSakuraCloud('/note');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(noteData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  } else if (uri === 'sakura:///sshkey') {
    try {
      validateCredentials();
      const sshkeyData = await fetchFromSakuraCloud('/sshkey');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(sshkeyData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching SSH keys:', error);
      throw error;
    }
  } else if (uri === 'sakura:///region') {
    try {
      validateCredentials();
      const regionData = await fetchFromSakuraCloud('/region');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(regionData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  } else if (uri === 'sakura:///zone') {
    try {
      validateCredentials();
      const zoneData = await fetchFromSakuraCloud('/zone');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(zoneData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  } else if (uri === 'sakura:///product') {
    try {
      validateCredentials();
      // Fetch multiple product types and combine them
      const serverPlans = await fetchFromSakuraCloud('/product/server');
      const diskPlans = await fetchFromSakuraCloud('/product/disk');
      const internetPlans = await fetchFromSakuraCloud('/product/internet');
      const licensePlans = await fetchFromSakuraCloud('/product/license');
      
      const combinedProducts = {
        server: serverPlans,
        disk: diskPlans,
        internet: internetPlans,
        license: licensePlans
      };
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(combinedProducts, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  } else if (uri === 'sakura:///commonserviceitem') {
    try {
      validateCredentials();
      const commonServiceItemData = await fetchFromSakuraCloud('/commonserviceitem');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(commonServiceItemData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching common service items:', error);
      throw error;
    }
  } else if (uri === 'sakura:///license') {
    try {
      validateCredentials();
      const licenseData = await fetchFromSakuraCloud('/license');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(licenseData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching licenses:', error);
      throw error;
    }
  } else if (uri === 'sakura:///auth-status') {
    try {
      validateCredentials();
      const authStatusData = await fetchFromSakuraCloud('/auth-status');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(authStatusData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching authentication status:', error);
      throw error;
    }
  } else if (uri === 'sakura:///bill') {
    try {
      validateCredentials();
      const billData = await fetchFromSakuraCloud('/bill');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(billData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching billing information:', error);
      throw error;
    }
  } else if (uri === 'sakura:///bill-detail') {
    try {
      validateCredentials();
      const billDetailData = await fetchFromSakuraCloud('/bill/detail');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(billDetailData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching billing details:', error);
      throw error;
    }
  } else if (uri === 'sakura:///coupon') {
    try {
      validateCredentials();
      const couponData = await fetchFromSakuraCloud('/coupon');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(couponData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  } else if (uri === 'sakura:///privatehost') {
    try {
      validateCredentials();
      const privateHostData = await fetchFromSakuraCloud('/privatehost');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(privateHostData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching private hosts:', error);
      throw error;
    }
  } else if (uri === 'sakura:///public-price') {
    try {
      // No authentication needed for public price API
      const priceData = await fetchFromSakuraCloud('/public/price', false);
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(priceData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching public price data:', error);
      throw error;
    }
  } else if (resourcePath === 'sakura:///apprun') {
    try {
      validateCredentials();
      const appRunData = await fetchFromAppRunAPI('/applications');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(appRunData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching AppRun data:', error);
      throw error;
    }
  }
  
  throw new Error(`Resource not found: ${resourcePath}`);
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_server_info',
        description: 'Get detailed information about a specific server',
        inputSchema: {
          type: 'object',
          properties: {
            serverId: {
              type: 'string',
              description: 'The ID of the server to retrieve'
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['serverId']
        }
      },
      {
        name: 'get_server_list',
        description: 'Get list of servers',
        inputSchema: {
          type: 'object',
          properties: {
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
        }
      },
      {
        name: 'get_switch_list',
        description: 'Get list of switches',
        inputSchema: {
          type: 'object',
          properties: {
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
        }
      },
      {
        name: 'get_switch_info',
        description: 'Get detailed information about a specific switch',
        inputSchema: {
          type: 'object',
          properties: {
            switchId: {
              type: 'string',
              description: 'The ID of the switch to retrieve'
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['switchId']
        }
      },
      {
        name: 'get_appliance_list',
        description: 'Get list of appliances',
        inputSchema: {
          type: 'object',
          properties: {
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
        }
      },
      {
        name: 'get_appliance_info',
        description: 'Get detailed information about a specific appliance',
        inputSchema: {
          type: 'object',
          properties: {
            applianceId: {
              type: 'string',
              description: 'The ID of the appliance to retrieve'
            }
          },
          required: ['applianceId']
        }
      },
      {
        name: 'get_disk_list',
        description: 'Get list of disks',
        inputSchema: {
          type: 'object',
          properties: {
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
        }
      },
      {
        name: 'get_disk_info',
        description: 'Get detailed information about a specific disk',
        inputSchema: {
          type: 'object',
          properties: {
            diskId: {
              type: 'string',
              description: 'The ID of the disk to retrieve'
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['diskId']
        }
      },
      {
        name: 'get_archive_list',
        description: 'Get list of archives',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_archive_info',
        description: 'Get detailed information about a specific archive',
        inputSchema: {
          type: 'object',
          properties: {
            archiveId: {
              type: 'string',
              description: 'The ID of the archive to retrieve'
            }
          },
          required: ['archiveId']
        }
      },
      {
        name: 'get_cdrom_list',
        description: 'Get list of ISO images',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_cdrom_info',
        description: 'Get detailed information about a specific ISO image',
        inputSchema: {
          type: 'object',
          properties: {
            cdromId: {
              type: 'string',
              description: 'The ID of the ISO image to retrieve'
            }
          },
          required: ['cdromId']
        }
      },
      {
        name: 'get_bridge_list',
        description: 'Get list of bridges',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_bridge_info',
        description: 'Get detailed information about a specific bridge',
        inputSchema: {
          type: 'object',
          properties: {
            bridgeId: {
              type: 'string',
              description: 'The ID of the bridge to retrieve'
            }
          },
          required: ['bridgeId']
        }
      },
      {
        name: 'get_router_list',
        description: 'Get list of routers',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_router_info',
        description: 'Get detailed information about a specific router',
        inputSchema: {
          type: 'object',
          properties: {
            routerId: {
              type: 'string',
              description: 'The ID of the router to retrieve'
            }
          },
          required: ['routerId']
        }
      },
      {
        name: 'get_interface_list',
        description: 'Get list of network interfaces',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_interface_info',
        description: 'Get detailed information about a specific network interface',
        inputSchema: {
          type: 'object',
          properties: {
            interfaceId: {
              type: 'string',
              description: 'The ID of the interface to retrieve'
            }
          },
          required: ['interfaceId']
        }
      },
      {
        name: 'get_icon_list',
        description: 'Get list of icons',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_icon_info',
        description: 'Get detailed information about a specific icon',
        inputSchema: {
          type: 'object',
          properties: {
            iconId: {
              type: 'string',
              description: 'The ID of the icon to retrieve'
            }
          },
          required: ['iconId']
        }
      },
      {
        name: 'get_note_list',
        description: 'Get list of notes and startup scripts',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_note_info',
        description: 'Get detailed information about a specific note or startup script',
        inputSchema: {
          type: 'object',
          properties: {
            noteId: {
              type: 'string',
              description: 'The ID of the note to retrieve'
            }
          },
          required: ['noteId']
        }
      },
      {
        name: 'get_sshkey_list',
        description: 'Get list of SSH keys',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_sshkey_info',
        description: 'Get detailed information about a specific SSH key',
        inputSchema: {
          type: 'object',
          properties: {
            sshkeyId: {
              type: 'string',
              description: 'The ID of the SSH key to retrieve'
            }
          },
          required: ['sshkeyId']
        }
      },
      {
        name: 'get_region_list',
        description: 'Get list of regions',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_region_info',
        description: 'Get detailed information about a specific region',
        inputSchema: {
          type: 'object',
          properties: {
            regionId: {
              type: 'string',
              description: 'The ID of the region to retrieve'
            }
          },
          required: ['regionId']
        }
      },
      {
        name: 'get_zone_list',
        description: 'Get list of zones',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_zone_info',
        description: 'Get detailed information about a specific zone',
        inputSchema: {
          type: 'object',
          properties: {
            zoneId: {
              type: 'string',
              description: 'The ID of the zone to retrieve'
            }
          },
          required: ['zoneId']
        }
      },
      {
        name: 'get_product_info',
        description: 'Get detailed information about specific product offerings',
        inputSchema: {
          type: 'object',
          properties: {
            productType: {
              type: 'string',
              description: 'The type of product to retrieve (server, disk, internet, license)',
              enum: ['server', 'disk', 'internet', 'license']
            }
          },
          required: ['productType']
        }
      },
      {
        name: 'get_commonserviceitem_list',
        description: 'Get list of common service items (DNS, Simple Monitor, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_commonserviceitem_info',
        description: 'Get detailed information about a specific common service item',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The ID of the common service item to retrieve'
            }
          },
          required: ['itemId']
        }
      },
      {
        name: 'get_license_list',
        description: 'Get list of licenses',
        inputSchema: {
          type: 'object',
          properties: {
          },
        }
      },
      {
        name: 'get_license_info',
        description: 'Get detailed information about a specific license',
        inputSchema: {
          type: 'object',
          properties: {
            licenseId: {
              type: 'string',
              description: 'The ID of the license to retrieve'
            }
          },
          required: ['licenseId']
        }
      },
      {
        name: 'get_bill_info',
        description: 'Get billing information for a specific month',
        inputSchema: {
          type: 'object',
          properties: {
            year: {
              type: 'string',
              description: 'The year (YYYY) of the billing period'
            },
            month: {
              type: 'string',
              description: 'The month (MM) of the billing period'
            }
          },
          required: ['year', 'month']
        }
      },
      {
        name: 'get_bill_detail',
        description: 'Get detailed billing information for a specific month',
        inputSchema: {
          type: 'object',
          properties: {
            year: {
              type: 'string',
              description: 'The year (YYYY) of the billing period'
            },
            month: {
              type: 'string',
              description: 'The month (MM) of the billing period'
            }
          },
          required: ['year', 'month']
        }
      },
      {
        name: 'get_coupon_info',
        description: 'Get information about a specific coupon',
        inputSchema: {
          type: 'object',
          properties: {
            couponId: {
              type: 'string',
              description: 'The ID of the coupon to retrieve'
            }
          },
          required: ['couponId']
        }
      },
      {
        name: 'get_privatehost_info',
        description: 'Get detailed information about a specific private host',
        inputSchema: {
          type: 'object',
          properties: {
            privateHostId: {
              type: 'string',
              description: 'The ID of the private host to retrieve'
            }
          },
          required: ['privateHostId']
        }
      },
      {
        name: 'get_public_price',
        description: 'Get public pricing information for Sakura Cloud services',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_apprun_list',
        description: 'Get list of all AppRun applications',
        inputSchema: {
          type: 'object',
          properties: {
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          }
        }
      },
      {
        name: 'get_apprun_info',
        description: 'Get detailed information about a specific AppRun application',
        inputSchema: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
              description: 'The ID of the AppRun application to retrieve'
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['appId']
        }
      },
      {
        name: 'create_apprun',
        description: 'Create a new AppRun application',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the AppRun application'
            },
            description: {
              type: 'string',
              description: 'Description of the AppRun application'
            },
            dockerImage: {
              type: 'string',
              description: 'Docker image to use for the AppRun application'
            },
            planId: {
              type: 'string',
              description: 'Plan ID for the AppRun application'
            },
            environment: {
              type: 'array',
              description: 'Environment variables for the AppRun application',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['name', 'dockerImage', 'planId']
        }
      },
      {
        name: 'delete_apprun',
        description: 'Delete an AppRun application',
        inputSchema: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
              description: 'The ID of the AppRun application to delete'
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['appId']
        }
      },
      {
        name: 'start_apprun',
        description: 'Start an AppRun application',
        inputSchema: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
              description: 'The ID of the AppRun application to start'
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['appId']
        }
      },
      {
        name: 'stop_apprun',
        description: 'Stop an AppRun application',
        inputSchema: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
              description: 'The ID of the AppRun application to stop'
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['appId']
        }
      },
      {
        name: 'update_apprun',
        description: 'Update an existing AppRun application',
        inputSchema: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
              description: 'The ID of the AppRun application to update'
            },
            name: {
              type: 'string',
              description: 'New name of the AppRun application'
            },
            description: {
              type: 'string',
              description: 'New description of the AppRun application'
            },
            dockerImage: {
              type: 'string',
              description: 'New Docker image to use for the AppRun application'
            },
            planId: {
              type: 'string',
              description: 'New plan ID for the AppRun application'
            },
            environment: {
              type: 'array',
              description: 'New environment variables for the AppRun application',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['appId']
        }
      },
      {
        name: 'get_apprun_logs',
        description: 'Get logs from an AppRun application',
        inputSchema: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
              description: 'The ID of the AppRun application to get logs from'
            },
            offset: {
              type: 'number',
              description: 'Offset to start fetching logs from (default: 0)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of log entries to fetch (default: 100)'
            },
            zone: {
              type: 'string',
              description: 'The zone to use (e.g., "tk1v", "is1a", "tk1a"). Defaults to "tk1v" if not specified.'
            }
          },
          required: ['appId']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get_server_info') {
    try {
      validateCredentials();
      
      const serverId = request.params.arguments?.serverId as string;
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const serverInfo = await fetchFromSakuraCloud(`/server/${serverId}`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(serverInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_server_list') {
    try {
      validateCredentials();
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const serverList = await fetchFromSakuraCloud(`/server`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(serverList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_switch_list') {
    try {
      validateCredentials();
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const switchList = await fetchFromSakuraCloud(`/switch`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(switchList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_switch_info') {
    try {
      validateCredentials();
      
      const switchId = request.params.arguments?.switchId as string;
      if (!switchId) {
        throw new Error('Switch ID is required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const switchInfo = await fetchFromSakuraCloud(`/switch/${switchId}`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(switchInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_appliance_list') {
    try {
      validateCredentials();
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const applianceList = await fetchFromSakuraCloud(`/appliance`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(applianceList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_appliance_info') {
    try {
      validateCredentials();
      
      const applianceId = request.params.arguments?.applianceId as string;
      if (!applianceId) {
        throw new Error('Appliance ID is required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const applianceInfo = await fetchFromSakuraCloud(`/appliance/${applianceId}`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(applianceInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_disk_list') {
    try {
      validateCredentials();
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const diskList = await fetchFromSakuraCloud(`/disk`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(diskList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_disk_info') {
    try {
      validateCredentials();
      
      const diskId = request.params.arguments?.diskId as string;
      if (!diskId) {
        throw new Error('Disk ID is required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const diskInfo = await fetchFromSakuraCloud(`/disk/${diskId}`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(diskInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_archive_list') {
    try {
      validateCredentials();
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const archiveList = await fetchFromSakuraCloud(`/archive`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(archiveList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_archive_info') {
    try {
      validateCredentials();
      
      const archiveId = request.params.arguments?.archiveId as string;
      if (!archiveId) {
        throw new Error('Archive ID is required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const archiveInfo = await fetchFromSakuraCloud(`/archive/${archiveId}`, false, zone);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(archiveInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_cdrom_list') {
    try {
      validateCredentials();
      
      const cdromList = await fetchFromSakuraCloud(`/cdrom`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(cdromList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_cdrom_info') {
    try {
      validateCredentials();
      
      const cdromId = request.params.arguments?.cdromId as string;
      if (!cdromId) {
        throw new Error('ISO Image ID is required');
      }
      
      const cdromInfo = await fetchFromSakuraCloud(`/cdrom/${cdromId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(cdromInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_bridge_list') {
    try {
      validateCredentials();
      
      const bridgeList = await fetchFromSakuraCloud(`/bridge`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(bridgeList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_bridge_info') {
    try {
      validateCredentials();
      
      const bridgeId = request.params.arguments?.bridgeId as string;
      if (!bridgeId) {
        throw new Error('Bridge ID is required');
      }
      
      const bridgeInfo = await fetchFromSakuraCloud(`/bridge/${bridgeId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(bridgeInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_router_list') {
    try {
      validateCredentials();
      
      const routerList = await fetchFromSakuraCloud(`/internet`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(routerList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_router_info') {
    try {
      validateCredentials();
      
      const routerId = request.params.arguments?.routerId as string;
      if (!routerId) {
        throw new Error('Router ID is required');
      }
      
      const routerInfo = await fetchFromSakuraCloud(`/internet/${routerId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(routerInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_interface_list') {
    try {
      validateCredentials();
      
      const interfaceList = await fetchFromSakuraCloud(`/interface`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(interfaceList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_interface_info') {
    try {
      validateCredentials();
      
      const interfaceId = request.params.arguments?.interfaceId as string;
      if (!interfaceId) {
        throw new Error('Interface ID is required');
      }
      
      const interfaceInfo = await fetchFromSakuraCloud(`/interface/${interfaceId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(interfaceInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_icon_list') {
    try {
      validateCredentials();
      
      const iconList = await fetchFromSakuraCloud(`/icon`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(iconList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_icon_info') {
    try {
      validateCredentials();
      
      const iconId = request.params.arguments?.iconId as string;
      if (!iconId) {
        throw new Error('Icon ID is required');
      }
      
      const iconInfo = await fetchFromSakuraCloud(`/icon/${iconId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(iconInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_note_list') {
    try {
      validateCredentials();
      
      const noteList = await fetchFromSakuraCloud(`/note`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(noteList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_note_info') {
    try {
      validateCredentials();
      
      const noteId = request.params.arguments?.noteId as string;
      if (!noteId) {
        throw new Error('Note ID is required');
      }
      
      const noteInfo = await fetchFromSakuraCloud(`/note/${noteId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(noteInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_sshkey_list') {
    try {
      validateCredentials();
      
      const sshkeyList = await fetchFromSakuraCloud(`/sshkey`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(sshkeyList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_sshkey_info') {
    try {
      validateCredentials();
      
      const sshkeyId = request.params.arguments?.sshkeyId as string;
      if (!sshkeyId) {
        throw new Error('SSH Key ID is required');
      }
      
      const sshkeyInfo = await fetchFromSakuraCloud(`/sshkey/${sshkeyId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(sshkeyInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_region_list') {
    try {
      validateCredentials();
      
      const regionList = await fetchFromSakuraCloud(`/region`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(regionList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_region_info') {
    try {
      validateCredentials();
      
      const regionId = request.params.arguments?.regionId as string;
      if (!regionId) {
        throw new Error('Region ID is required');
      }
      
      const regionInfo = await fetchFromSakuraCloud(`/region/${regionId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(regionInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_zone_list') {
    try {
      validateCredentials();
      
      const zoneList = await fetchFromSakuraCloud(`/zone`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(zoneList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_zone_info') {
    try {
      validateCredentials();
      
      const zoneId = request.params.arguments?.zoneId as string;
      if (!zoneId) {
        throw new Error('Zone ID is required');
      }
      
      const zoneInfo = await fetchFromSakuraCloud(`/zone/${zoneId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(zoneInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_product_info') {
    try {
      validateCredentials();
      
      const productType = request.params.arguments?.productType as string;
      if (!productType) {
        throw new Error('Product type is required');
      }
      
      // Validate product type
      if (!['server', 'disk', 'internet', 'license'].includes(productType)) {
        throw new Error('Invalid product type. Must be one of: server, disk, internet, license');
      }
      
      const productInfo = await fetchFromSakuraCloud(`/product/${productType}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(productInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_commonserviceitem_list') {
    try {
      validateCredentials();
      
      const commonServiceItemList = await fetchFromSakuraCloud(`/commonserviceitem`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(commonServiceItemList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_commonserviceitem_info') {
    try {
      validateCredentials();
      
      const itemId = request.params.arguments?.itemId as string;
      if (!itemId) {
        throw new Error('Common Service Item ID is required');
      }
      
      const itemInfo = await fetchFromSakuraCloud(`/commonserviceitem/${itemId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(itemInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_license_list') {
    try {
      validateCredentials();
      
      const licenseList = await fetchFromSakuraCloud(`/license`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(licenseList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_license_info') {
    try {
      validateCredentials();
      
      const licenseId = request.params.arguments?.licenseId as string;
      if (!licenseId) {
        throw new Error('License ID is required');
      }
      
      const licenseInfo = await fetchFromSakuraCloud(`/license/${licenseId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(licenseInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_bill_info') {
    try {
      validateCredentials();
      
      const year = request.params.arguments?.year as string;
      const month = request.params.arguments?.month as string;
      
      if (!year || !month) {
        throw new Error('Year and month are required for billing information');
      }
      
      const billInfo = await fetchFromSakuraCloud(`/bill/${year}${month}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(billInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_bill_detail') {
    try {
      validateCredentials();
      
      const year = request.params.arguments?.year as string;
      const month = request.params.arguments?.month as string;
      
      if (!year || !month) {
        throw new Error('Year and month are required for billing details');
      }
      
      const billDetailInfo = await fetchFromSakuraCloud(`/bill/${year}${month}/detail`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(billDetailInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_coupon_info') {
    try {
      validateCredentials();
      
      const couponId = request.params.arguments?.couponId as string;
      if (!couponId) {
        throw new Error('Coupon ID is required');
      }
      
      const couponInfo = await fetchFromSakuraCloud(`/coupon/${couponId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(couponInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_privatehost_info') {
    try {
      validateCredentials();
      
      const privateHostId = request.params.arguments?.privateHostId as string;
      if (!privateHostId) {
        throw new Error('Private Host ID is required');
      }
      
      const privateHostInfo = await fetchFromSakuraCloud(`/privatehost/${privateHostId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(privateHostInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_public_price') {
    try {
      // No authentication needed for public price API
      const priceData = await fetchFromSakuraCloud('/public/price', true);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(priceData, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_apprun_list') {
    try {
      validateCredentials();
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const appRunList = await fetchFromAppRunAPI('/applications');
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(appRunList, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_apprun_info') {
    try {
      validateCredentials();
      
      const appId = request.params.arguments?.appId as string;
      if (!appId) {
        throw new Error('AppRun application ID is required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const appRunInfo = await fetchFromAppRunAPI(`/applications/${appId}`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(appRunInfo, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'create_apprun') {
    try {
      validateCredentials();
      
      const name = request.params.arguments?.name as string;
      const description = request.params.arguments?.description as string || '';
      const dockerImage = request.params.arguments?.dockerImage as string;
      const planId = request.params.arguments?.planId as string;
      const environment = request.params.arguments?.environment as Array<{key: string, value: string}> || [];
      
      if (!name || !dockerImage || !planId) {
        throw new Error('Name, Docker image, and plan ID are required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      
      const createBody = {
        name: name,
        description: description,
        planId: planId,
        image: dockerImage,
        environment: environment.map(env => ({ key: env.key, value: env.value })),
      };
      
      const createResult = await fetchFromAppRunAPI('/applications', 'POST', createBody);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(createResult, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'delete_apprun') {
    try {
      validateCredentials();
      
      const appId = request.params.arguments?.appId as string;
      if (!appId) {
        throw new Error('AppRun application ID is required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const deleteResult = await fetchFromAppRunAPI(`/applications/${appId}`, 'DELETE');
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(deleteResult, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'start_apprun') {
    try {
      validateCredentials();
      
      const appId = request.params.arguments?.appId as string;
      if (!appId) {
        throw new Error('AppRun application ID is required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const startResult = await fetchFromAppRunAPI(`/applications/${appId}/start`, 'POST');
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(startResult, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'stop_apprun') {
    try {
      validateCredentials();
      
      const appId = request.params.arguments?.appId as string;
      if (!appId) {
        throw new Error('AppRun application ID is required');
      }
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const stopResult = await fetchFromAppRunAPI(`/applications/${appId}/stop`, 'POST');
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stopResult, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'update_apprun') {
    try {
      validateCredentials();
      
      const appId = request.params.arguments?.appId as string;
      if (!appId) {
        throw new Error('AppRun application ID is required');
      }
      
      // Get current application data first
      const currentApp = await fetchFromAppRunAPI(`/applications/${appId}`);
      
      // Extract current values
      const currentName = currentApp.name || '';
      const currentDescription = currentApp.description || '';
      const currentPlanId = currentApp.planId || '';
      const currentDockerImage = currentApp.image || '';
      const currentEnvironment = currentApp.environment || [];
      
      // Get update values from request or use current values
      const name = request.params.arguments?.name as string || currentName;
      const description = request.params.arguments?.description as string || currentDescription;
      const planId = request.params.arguments?.planId as string || currentPlanId;
      const dockerImage = request.params.arguments?.dockerImage as string || currentDockerImage;
      const environment = request.params.arguments?.environment as Array<{key: string, value: string}> || 
        currentEnvironment.map((env: {Key: string, Value: string}) => ({ key: env.Key, value: env.Value }));
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      
      const updateBody = {
        name: name,
        description: description,
        planId: planId,
        image: dockerImage,
        environment: environment.map(env => ({ key: env.key, value: env.value })),
      };
      
      const updateResult = await fetchFromAppRunAPI(`/applications/${appId}`, 'PUT', updateBody);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(updateResult, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  } else if (request.params.name === 'get_apprun_logs') {
    try {
      validateCredentials();
      
      const appId = request.params.arguments?.appId as string;
      if (!appId) {
        throw new Error('AppRun application ID is required');
      }
      
      const offset = request.params.arguments?.offset as number || 0;
      const limit = request.params.arguments?.limit as number || 100;
      
      const zone = request.params.arguments?.zone as string || DEFAULT_ZONE;
      const logsQuery = `/applications/${appId}/logs?offset=${offset}&limit=${limit}`;
      const logs = await fetchFromAppRunAPI(logsQuery);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(logs, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      throw error;
    }
  }
  
  throw new Error(`Tool not found: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sacloud MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});