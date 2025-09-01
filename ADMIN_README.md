# Admin Portal - Leader Dashboard

The admin portal is a separate interface for leaders at different administrative levels (Cell, Sector, District) to manage and respond to citizen issues.

## Access

Navigate to `/admin` or click the "Admin" button in the main application header to access the leader dashboard.

## Login Credentials

Use these demo credentials to log in as different types of leaders:

### Cell Leaders
- **Email:** jp.habimana@cell.gov.rw
- **Password:** admin123
- **Level:** Cell (Kamatamu, Kacyiru, Gasabo)

- **Email:** c.mukamana@cell.gov.rw  
- **Password:** admin123
- **Level:** Cell (Biryogo, Nyamirambo, Nyarugenge)

### Sector Leaders
- **Email:** mc.uwamahoro@sector.gov.rw
- **Password:** admin123
- **Level:** Sector (Kacyiru, Gasabo)

- **Email:** d.nzeyimana@sector.gov.rw
- **Password:** admin123
- **Level:** Sector (Nyamirambo, Nyarugenge)

### District Leaders
- **Email:** e.ntirenganya@district.gov.rw
- **Password:** admin123
- **Level:** District (Gasabo)

- **Email:** g.kayitesi@district.gov.rw
- **Password:** admin123
- **Level:** District (Nyarugenge)

## Features

### Dashboard
- Overview of assigned issues
- Statistics on pending, in-progress, and resolved issues
- Recent activity summary

### Issues Management
- View all issues assigned to your administrative level
- Filter issues by status (pending, in-progress, resolved, escalated)
- Filter issues by priority (low, medium, high, urgent)
- Update issue status and priority
- Add comments and responses to issues
- Escalate issues to higher administrative levels

### Issue Detail View
- Complete issue information including citizen reports
- Comment thread with citizen and other officials
- Assignment details and deadlines
- Actions panel for status updates, priority changes, and escalation

### Administrative Hierarchy

The system follows Rwanda's administrative structure:
- **District Level:** Highest level, can handle all issues
- **Sector Level:** Can handle sector and cell-level issues
- **Cell Level:** Can handle cell and village-level issues

### Escalation Process

Leaders can escalate issues that are beyond their capacity or authority:
- **Cell → Sector:** Issues requiring sector-wide coordination
- **Sector → District:** Issues requiring district-level resources or policy decisions
- **Automatic Assignment:** Issues are automatically assigned based on their administrative level

### Key Capabilities

1. **Issue Response:** Leaders can respond directly to citizen issues with official comments
2. **Status Management:** Update issue status from pending → in-progress → resolved
3. **Priority Control:** Adjust issue priority based on urgency and impact  
4. **Escalation:** Pass complex issues to appropriate higher authorities
5. **Follow-up:** Request additional information from citizens when needed
6. **Coordination:** Communicate with other leaders and departments

### Geographic Restrictions

Each leader can only see and manage issues within their geographic jurisdiction:
- Cell leaders: Issues from their specific cell only
- Sector leaders: Issues from their sector and constituent cells
- District leaders: Issues from their district, sectors, and cells

This ensures proper administrative boundaries and prevents conflicts in issue management.

## Technical Notes

- Uses separate authentication system from citizen engagement platform
- Maintains separate data models for leader accounts and issue assignments
- Implements role-based access control based on administrative level
- Supports real-time updates on issue status changes
