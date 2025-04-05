# Sakura Cloud MCP Server

A Model Context Protocol (MCP) server implementation for interacting with Sakura Cloud's API.

## What is MCP?

The Model Context Protocol (MCP) is a standardized communication protocol that enables AI applications to securely interact with external systems and data sources. It follows a client-server architecture where LLM applications initiate connections to servers that expose resources and tools.

## Overview

This project implements an MCP server that allows AI assistants to interact with Sakura Cloud infrastructure through a standardized interface. It enables AI assistants to:

- Access Sakura Cloud resources like servers, disks, networks, and more
- Use tools to list resources and retrieve detailed information about specific resources
- Query public pricing information without authentication requirements
- Manage AppRun containerized applications

## Prerequisites

- Node.js (v16 or higher)
- Sakura Cloud API credentials (token and secret)
- Claude Desktop app for using with Claude (MCP is currently only supported in the desktop app)

## Installation

```bash
# Clone the repository
git clone https://github.com/hidenorigoto/sacloud-mcp.git
cd sacloud-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Set the following environment variables:

- `SACLOUD_API_TOKEN`: Your Sakura Cloud API token
- `SACLOUD_API_SECRET`: Your Sakura Cloud API secret

## Usage

### Available Resources

| Resource URI | Description |
|--------------|-------------|
| `sakura:///servers` | Lists all servers in your Sakura Cloud account |
| `sakura:///switches` | Lists all switches in your Sakura Cloud account |
| `sakura:///appliances` | Lists all appliances in your Sakura Cloud account |
| `sakura:///disks` | Lists all disks in your Sakura Cloud account |
| `sakura:///archives` | Lists all archives in your Sakura Cloud account |
| `sakura:///cdrom` | Lists all ISO images (CD-ROMs) in your Sakura Cloud account |
| `sakura:///bridge` | Lists all bridges in your Sakura Cloud account |
| `sakura:///internet` | Lists all routers in your Sakura Cloud account |
| `sakura:///interface` | Lists all network interfaces in your Sakura Cloud account |
| `sakura:///icon` | Lists all icons in your Sakura Cloud account |
| `sakura:///note` | Lists all startup scripts and notes in your Sakura Cloud account |
| `sakura:///sshkey` | Lists all SSH keys in your Sakura Cloud account |
| `sakura:///region` | Lists all regions in your Sakura Cloud account |
| `sakura:///zone` | Lists all zones in your Sakura Cloud account |
| `sakura:///product` | Lists all available products in your Sakura Cloud account |
| `sakura:///commonserviceitem` | Lists all common service items (DNS, Simple Monitor, etc.) in your Sakura Cloud account |
| `sakura:///license` | Lists all licenses in your Sakura Cloud account |
| `sakura:///auth-status` | Shows current authentication status and permissions |
| `sakura:///bill` | Shows monthly billing information |
| `sakura:///bill-detail` | Shows detailed breakdown of billing information |
| `sakura:///coupon` | Lists all available coupons |
| `sakura:///privatehost` | Lists all private hosts in your Sakura Cloud account |
| `sakura:///public-price` | Shows public pricing information for Sakura Cloud services (no authentication required) |
| `sakura:///apprun` | Lists all AppRun applications in your Sakura Cloud account |

### Available Tools

| Tool Name | Description | Required Parameters |
|-----------|-------------|---------------------|
| `get_server_list` | Retrieves list of all servers | None |
| `get_server_info` | Retrieves detailed information about a specific server | `serverId` |
| `get_switch_list` | Retrieves list of all switches | None |
| `get_switch_info` | Retrieves detailed information about a specific switch | `switchId` |
| `get_appliance_list` | Retrieves list of all appliances | None |
| `get_appliance_info` | Retrieves detailed information about a specific appliance | `applianceId` |
| `get_disk_list` | Retrieves list of all disks | None |
| `get_disk_info` | Retrieves detailed information about a specific disk | `diskId` |
| `get_archive_list` | Retrieves list of all archives | None |
| `get_archive_info` | Retrieves detailed information about a specific archive | `archiveId` |
| `get_cdrom_list` | Retrieves list of all ISO images | None |
| `get_cdrom_info` | Retrieves detailed information about a specific ISO image | `cdromId` |
| `get_bridge_list` | Retrieves list of all bridges | None |
| `get_bridge_info` | Retrieves detailed information about a specific bridge | `bridgeId` |
| `get_router_list` | Retrieves list of all routers | None |
| `get_router_info` | Retrieves detailed information about a specific router | `routerId` |
| `get_interface_list` | Retrieves list of all network interfaces | None |
| `get_interface_info` | Retrieves detailed information about a specific network interface | `interfaceId` |
| `get_icon_list` | Retrieves list of all icons | None |
| `get_icon_info` | Retrieves detailed information about a specific icon | `iconId` |
| `get_note_list` | Retrieves list of all notes and startup scripts | None |
| `get_note_info` | Retrieves detailed information about a specific note or startup script | `noteId` |
| `get_sshkey_list` | Retrieves list of all SSH keys | None |
| `get_sshkey_info` | Retrieves detailed information about a specific SSH key | `sshkeyId` |
| `get_region_list` | Retrieves list of all regions | None |
| `get_region_info` | Retrieves detailed information about a specific region | `regionId` |
| `get_zone_list` | Retrieves list of all zones | None |
| `get_zone_info` | Retrieves detailed information about a specific zone | `zoneId` |
| `get_product_info` | Retrieves detailed information about specific product offerings | `productType` |
| `get_commonserviceitem_list` | Retrieves list of all common service items | None |
| `get_commonserviceitem_info` | Retrieves detailed information about a specific common service item | `itemId` |
| `get_license_list` | Retrieves list of all licenses | None |
| `get_license_info` | Retrieves detailed information about a specific license | `licenseId` |
| `get_bill_info` | Retrieves billing information for a specific month | `year`, `month` |
| `get_bill_detail` | Retrieves detailed billing information for a specific month | `year`, `month` |
| `get_coupon_info` | Retrieves information about a specific coupon | `couponId` |
| `get_privatehost_info` | Retrieves detailed information about a specific private host | `privateHostId` |
| `get_public_price` | Retrieves public pricing information for Sakura Cloud services | None |
| `get_apprun_list` | Retrieves list of all AppRun applications | None |
| `get_apprun_info` | Retrieves detailed information about a specific AppRun application | `appId` |
| `create_apprun` | Creates a new AppRun application | `name`, `dockerImage`, `planId` |
| `delete_apprun` | Deletes an AppRun application | `appId` |
| `start_apprun` | Starts an AppRun application | `appId` |
| `stop_apprun` | Stops an AppRun application | `appId` |
| `update_apprun` | Updates an existing AppRun application | `appId` |
| `get_apprun_logs` | Gets logs from an AppRun application | `appId` |

## AppRun Integration

Sakura Cloud AppRun is a containerized application platform that allows you to run Docker containers without managing infrastructure. This MCP server provides full AppRun management capabilities:

- View all your AppRun applications
- Create new applications with custom Docker images
- Update existing applications (change image, configuration, etc.)
- Start and stop applications
- View application logs
- Delete applications when no longer needed

When creating or updating an AppRun application, you can specify:
- Application name and description
- Docker image to use
- Plan ID (determines resources allocated)
- Environment variables as key-value pairs

## Zone Support

All API calls support specifying a zone parameter to target specific Sakura Cloud data centers. The default zone is `tk1v` (Tokyo), but you can specify others such as:
- `is1a` (Ishikari)
- `tk1a` (Tokyo)
- And more...

Example URI with zone parameter: `sakura:///servers?zone=is1a`

## Integrating with Claude

Claude Desktop app provides MCP support. Follow these steps to integrate this server with Claude:

1. Make sure the server is running locally or on an accessible host.

2. Create a `claude_desktop_config.json` file in the appropriate location for your OS:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

3. Add the following configuration to the file:

```json
{
  "sacloud-server": {
    "command": "node",
    "args": ["path/to/mcp/dist/server.js"],
    "env": {
      "SACLOUD_API_TOKEN": "your_token_here",
      "SACLOUD_API_SECRET": "your_secret_here"
    }
  }
}
```

4. Restart the Claude Desktop app to apply the configuration.

5. In a conversation with Claude, you can now access Sakura Cloud resources and tools.

## Security Considerations

- This server handles sensitive API credentials
- Never commit API tokens or secrets to version control
- Use environment variables for all sensitive information
- Implement proper access controls in production

## License

ISC