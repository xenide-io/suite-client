// Generated from docs/reports/event-audit/tracking-plan.json by
// scripts/analytics/generate.mjs. Do not edit by hand.

export type AnalyticsEventName =
  | "AI Action Resolved"
  | "AI Chat Cleared"
  | "AI Chat Opened"
  | "AI Credits Exhausted"
  | "AI Job Updated"
  | "AI Message Cancelled"
  | "AI Message Sent"
  | "AI Model Created"
  | "AI Model Updated"
  | "AI Provider Created"
  | "AI Provider Updated"
  | "AI Writing Assist Used"
  | "AI Writing Suggestion Applied"
  | "API Key Created"
  | "API Key Updated"
  | "API Request Recorded"
  | "Account Connected"
  | "Account Disconnected"
  | "Add-on Quantity Updated"
  | "App Launched"
  | "Approval Requested"
  | "Approval Resolved"
  | "Assignment Created"
  | "Assignment Created Blocked Credits"
  | "Assistant Appearance Changed"
  | "Attachment Updated"
  | "Billable Report Exported"
  | "Billing Cycle Updated"
  | "Budget Exceeded"
  | "Budget Hours Updated"
  | "Category Created"
  | "Category Updated"
  | "Chat Action Decided"
  | "Chat Actions Approved All"
  | "Chat Attachment Updated"
  | "Chat Message Failed"
  | "Chat Message Retried"
  | "Chat Message Sent"
  | "Chat Research Enabled"
  | "Chat Session Created"
  | "Chat Session Deleted"
  | "Chat Work Created"
  | "Checkout Started"
  | "Client Created"
  | "Client Error"
  | "Client Updated"
  | "Collaboration Session Started"
  | "Command Palette Action"
  | "Comment Created"
  | "Comment Updated"
  | "Credential Created"
  | "Credential Tested"
  | "Credential Updated"
  | "Credit Pack Purchased"
  | "Credits Purchase Started"
  | "Credits Purchased"
  | "Credits Recorded"
  | "Crew Client Access Updated"
  | "Crew Created"
  | "Crew Integration Updated"
  | "Crew MCP Updated"
  | "Crew Paused"
  | "Crew Resumed"
  | "Crew Skill Updated"
  | "Crew Tool Policy Saved"
  | "Crew Updated"
  | "Cross-App Switch"
  | "Deep Research Toggled"
  | "Deep Search Cancelled"
  | "Deep Search Run"
  | "Deployment Created"
  | "Deployment Run Now"
  | "Deployment Triggered"
  | "Deployment Updated"
  | "Deployment Webhook Received"
  | "Document Autosaved"
  | "Document Created"
  | "Document Edited"
  | "Document Exported"
  | "Document Grant Updated"
  | "Document Markdown Imported"
  | "Document Opened"
  | "Document Presence Seen"
  | "Document Resource Updated"
  | "Document Updated"
  | "Editor Block Inserted"
  | "Email Sent"
  | "Email Verified"
  | "Expense Created"
  | "Expense Updated"
  | "Filter Updated"
  | "Flow Created"
  | "Flow Draft Generated"
  | "Flow Saved"
  | "Flow Task Linked"
  | "Folder Exported"
  | "Forecast Preview Generated"
  | "Gate Decided"
  | "Gate Expired"
  | "Icon Picker Tab Changed"
  | "Icon Selected"
  | "Integration Binding Saved"
  | "Integration Connect Failed"
  | "Integration Connect Started"
  | "Integration Connected"
  | "Integration Disconnected"
  | "Integration Rule Created"
  | "Integration Rule Updated"
  | "Integration Selected"
  | "Integration Sync Run"
  | "Integration Webhook Received"
  | "Integration Workspace Scope Updated"
  | "Invite Accepted"
  | "Invite Revoked"
  | "Invoice Created"
  | "Invoice Emailed"
  | "Invoice Sent"
  | "Invoice Updated"
  | "Link Copied"
  | "Login Failed"
  | "Login Provider Started"
  | "MCP Server Created"
  | "MCP Server Updated"
  | "Mattermost Connect Completed"
  | "Mattermost Connect Started"
  | "Member Invited"
  | "Member Updated"
  | "Memory Created"
  | "Memory Updated"
  | "Mention Inserted"
  | "Notification Dispatched"
  | "Notification Opened"
  | "Notification Read"
  | "OAuth Login Started"
  | "Organisation Created"
  | "Organisation SSO Updated"
  | "Organisation Switched"
  | "Organisation Updated"
  | "Page Link Inserted"
  | "Password Reset Completed"
  | "Password Reset Requested"
  | "Password Updated"
  | "Plan Selected"
  | "Plan Updated"
  | "Project Created"
  | "Project Updated"
  | "Proposal Applied"
  | "Proposal Generated"
  | "Proposal Rejected"
  | "Public Share Toggled"
  | "Push Notifications Configured"
  | "Report CSV Downloaded"
  | "Report CSV Previewed"
  | "Report Exported"
  | "Research Answer Feedback"
  | "Research Answer Regenerated"
  | "Research Answer Saved as Document"
  | "Research Chat Opened"
  | "Research Job Created"
  | "Research Model Selected"
  | "Research Model Updated"
  | "Research Session Cleared"
  | "Retainer Updated"
  | "Revision Restored"
  | "Run Cancelled"
  | "Run Completed"
  | "Run Failed"
  | "Run Report Acknowledged"
  | "Run Retried"
  | "Run Started"
  | "Scheduled Task Ran"
  | "Search Performed"
  | "Seats Updated"
  | "Session Expired"
  | "Skill Created"
  | "Skill Online Imported"
  | "Skill Updated"
  | "Subscription Cancelled"
  | "Subscription Started"
  | "Subscription Synced"
  | "Subscription Updated"
  | "Subtask Created"
  | "Subtask Updated"
  | "Tab Viewed"
  | "Tag Created"
  | "Tag Updated"
  | "Task Completed"
  | "Task Created"
  | "Task Deleted"
  | "Task Moved"
  | "Task Opened"
  | "Task Relation Created"
  | "Task Relation Updated"
  | "Task Reopened"
  | "Task Reordered"
  | "Task Scheduled"
  | "Task Status Updated"
  | "Task Template Created"
  | "Task Template Updated"
  | "Task Updated"
  | "Theme Updated"
  | "Tides Task Closed"
  | "Tides Task Created from Note"
  | "Tides Task Linked"
  | "Time Entry Logged"
  | "Time Entry Updated"
  | "Time Logged"
  | "Timer Resumed from Entry"
  | "Timer Started"
  | "Timer Stopped"
  | "Timesheet Approved"
  | "Timesheet Declined"
  | "Timesheet Submitted"
  | "Today Refreshed"
  | "Track Modal Opened"
  | "User Logged In"
  | "User Logged Out"
  | "User Signed Up"
  | "Verification Email Resent"
  | "View Updated"
  | "Workflow Status Created"
  | "Workflow Status Updated"
  | "Workspace Created"
  | "Workspace Deleted"
  | "Workspace Deletion Started"
  | "Workspace Files Attached"
  | "Workspace Indexed for Search"
  | "Workspace Provisioned"
  | "Workspace Switched"
  | "Workspace Updated";

export type AnalyticsPropertyName =
  | "action"
  | "action_count"
  | "action_id"
  | "action_kind"
  | "active_filter_count"
  | "active_workspace_id"
  | "addon_slug"
  | "agent_version"
  | "ai_credit_limit"
  | "allowlist_count"
  | "amount"
  | "amount_cents"
  | "annual_discount"
  | "app"
  | "app_access"
  | "approval_id"
  | "assigned_to_self"
  | "assignee_added"
  | "assignee_count"
  | "assignment_id"
  | "at_period_end"
  | "attachment_count"
  | "attachment_id"
  | "attempts"
  | "auth_mode"
  | "auth_scheme"
  | "base_model"
  | "base_url_host"
  | "billable"
  | "billable_filter"
  | "billed"
  | "block_type"
  | "bridge_slug"
  | "budget_kind"
  | "bulk"
  | "calendar_linked"
  | "can_access_kraken"
  | "can_access_shelly"
  | "can_access_tides"
  | "can_access_turtletime"
  | "can_edit"
  | "cascaded_descendants"
  | "category"
  | "category_id"
  | "changed_date"
  | "channel"
  | "citation_count"
  | "client_access_mode"
  | "client_changed"
  | "client_id"
  | "collaborative"
  | "collaborator_count"
  | "colour"
  | "colour_changed"
  | "comment_id"
  | "connection_id"
  | "content_length"
  | "context"
  | "control"
  | "copy_kind"
  | "cost_usd"
  | "count"
  | "country"
  | "created_at"
  | "created_user"
  | "credential_id"
  | "credits"
  | "credits_source"
  | "crew_count"
  | "crew_id"
  | "currency"
  | "current"
  | "cycle"
  | "date_set"
  | "decision"
  | "deep_research"
  | "degraded"
  | "deleted_count"
  | "deployment_id"
  | "deployment_mode"
  | "description_length"
  | "description_length_flow"
  | "dest_parent_id"
  | "destination_app"
  | "destination_parent_id"
  | "destructive"
  | "direction"
  | "distinct_id"
  | "document_id"
  | "document_kind"
  | "document_read"
  | "due_date"
  | "duration_ms"
  | "duration_seconds"
  | "email_domain"
  | "email_sent"
  | "email_verified"
  | "enabled"
  | "end_time"
  | "endpoint"
  | "endpoint_count"
  | "entry_count"
  | "entry_id"
  | "environment"
  | "error"
  | "error_message"
  | "error_type"
  | "errors"
  | "estimate_minutes"
  | "event_source"
  | "event_type"
  | "expense_id"
  | "expired"
  | "exported"
  | "feature"
  | "field"
  | "fields_changed"
  | "file_count"
  | "file_size_bytes"
  | "file_type"
  | "filter"
  | "filter_count"
  | "filter_kind"
  | "first_app"
  | "folder_count"
  | "format"
  | "from_app"
  | "from_calendar"
  | "from_deeplink"
  | "from_index"
  | "from_org_id"
  | "from_plan"
  | "from_priority"
  | "from_project_id"
  | "from_role"
  | "from_slug"
  | "from_status"
  | "from_status_id"
  | "from_tier"
  | "from_workspace_id"
  | "full_access"
  | "gate_id"
  | "gate_type"
  | "goal_present"
  | "grant_id"
  | "grantee_user_id"
  | "group_by"
  | "had_due_date"
  | "had_subtasks"
  | "had_value"
  | "has_attachment"
  | "has_brand_title"
  | "has_budget"
  | "has_client"
  | "has_color"
  | "has_cron"
  | "has_description"
  | "has_due_date"
  | "has_expiry"
  | "has_icon_image"
  | "has_instructions"
  | "has_logo"
  | "has_mentions"
  | "has_name"
  | "has_notes"
  | "has_rate"
  | "has_reason"
  | "has_role"
  | "has_secret"
  | "has_summary"
  | "has_title"
  | "has_value"
  | "hourly_rate"
  | "icon_changed"
  | "imported"
  | "include_web"
  | "include_workspace"
  | "index"
  | "input_tokens"
  | "integration_app"
  | "interval"
  | "invite_id"
  | "invite_token"
  | "invoice_id"
  | "invoice_number"
  | "is_active"
  | "is_admin"
  | "is_archived"
  | "is_authenticated"
  | "is_default"
  | "is_edit"
  | "is_enabled"
  | "is_favourite"
  | "is_final"
  | "is_first_org"
  | "is_first_workspace"
  | "is_locked"
  | "is_new_session"
  | "is_org"
  | "is_overdue"
  | "is_personal"
  | "is_preset"
  | "is_regenerate"
  | "is_shared"
  | "is_tides"
  | "job_id"
  | "key"
  | "key_id"
  | "kind"
  | "label"
  | "language"
  | "latency_ms"
  | "length"
  | "line_count"
  | "link_mode"
  | "matched_rules"
  | "max_concurrency"
  | "mcp_mode"
  | "mcp_server_id"
  | "member_id"
  | "memory_id"
  | "mention_count"
  | "mentioned_user_id"
  | "message_count"
  | "method"
  | "mode"
  | "mode_flow"
  | "model"
  | "model_count"
  | "model_id"
  | "model_label"
  | "monthly_rate"
  | "mrr_delta"
  | "multi_workspace"
  | "name"
  | "name_changed"
  | "name_confirmed"
  | "new_index"
  | "new_run_id"
  | "new_tab"
  | "new_tier"
  | "node_id"
  | "notification_id"
  | "object_counts"
  | "offset"
  | "ok"
  | "old_index"
  | "old_tier"
  | "operation"
  | "org_count"
  | "org_id"
  | "organisation_id"
  | "organisation_name"
  | "organisation_name_evt"
  | "origin"
  | "outcome"
  | "output_tokens"
  | "pack"
  | "pack_slug"
  | "page_path"
  | "page_size"
  | "parent_id"
  | "parent_task_id"
  | "path"
  | "pending_gate_count"
  | "per_app_overrides"
  | "period"
  | "permission"
  | "phase"
  | "plan"
  | "plan_tier"
  | "position"
  | "preset"
  | "prior_status"
  | "priority"
  | "product"
  | "project_id"
  | "project_name"
  | "prompt_length"
  | "proposal_count"
  | "proposal_id"
  | "provider"
  | "provider_id"
  | "provider_kind"
  | "provider_label"
  | "provider_name"
  | "quantity"
  | "query"
  | "query_length"
  | "rating"
  | "reason"
  | "redirect_uri"
  | "referrer"
  | "region"
  | "registry_name"
  | "relation_count"
  | "relation_type"
  | "resource_type"
  | "result_count"
  | "revision_number"
  | "role"
  | "rule_id"
  | "rule_type"
  | "run_id"
  | "save_type"
  | "schedule_cron"
  | "scope"
  | "scope_count"
  | "seat_type"
  | "seat_usage"
  | "seats"
  | "secret_set"
  | "selected_day"
  | "selection_length"
  | "session_id"
  | "signup_app"
  | "signup_source"
  | "skill_id"
  | "slug"
  | "sort_by"
  | "source_app"
  | "source_count"
  | "source_surface"
  | "source_surface_flow"
  | "source_type"
  | "species"
  | "start_date"
  | "start_time"
  | "starter_index"
  | "state"
  | "status"
  | "status_class"
  | "status_id"
  | "subtask_id"
  | "succeeded"
  | "success"
  | "surface"
  | "tab"
  | "tag_count"
  | "tag_id"
  | "tags_added"
  | "target"
  | "target_app"
  | "target_document_id"
  | "target_task_id"
  | "task"
  | "task_count"
  | "task_id"
  | "task_write"
  | "template"
  | "template_id"
  | "theme"
  | "tides_task_id"
  | "tier_slug"
  | "timer_running"
  | "title_length"
  | "to_index"
  | "to_org_id"
  | "to_plan"
  | "to_priority"
  | "to_project_id"
  | "to_role"
  | "to_slug"
  | "to_status"
  | "to_status_id"
  | "to_tier"
  | "to_workspace_id"
  | "tool"
  | "tool_calls_count"
  | "tool_name"
  | "toolkit_slug"
  | "total_size_bytes"
  | "total_tokens"
  | "transport"
  | "trigger"
  | "turn_id"
  | "unit"
  | "unread_count"
  | "user_role"
  | "value"
  | "verb"
  | "verification_required"
  | "via"
  | "view"
  | "visibility"
  | "was_running"
  | "web_search"
  | "webhook_token_prefix"
  | "word_count"
  | "workflow"
  | "workspace_count"
  | "workspace_id"
  | "workspace_is_personal"
  | "workspace_name"
  | "workspace_provisioned"
  | "workspace_tier"
  | "workspace_usage"
  | "yearly"
  | "yjs_enabled";

export interface AnalyticsEventDefinition {
  readonly category: string;
  readonly apps: readonly string[];
  readonly source: readonly string[];
  readonly status: string;
}

export const ANALYTICS_EVENTS: Record<
  AnalyticsEventName,
  AnalyticsEventDefinition
> = {
  "AI Action Resolved": {
    category: "AI (shared Shelly panel, AI jobs)",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "AI Chat Cleared": {
    category: "AI (shared Shelly panel, AI jobs)",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "AI Chat Opened": {
    category: "AI (shared Shelly panel, AI jobs)",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "AI Credits Exhausted": {
    category: "Billing & subscription",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "AI Job Updated": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "AI Message Cancelled": {
    category: "AI (shared Shelly panel, AI jobs)",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "AI Message Sent": {
    category: "AI (shared Shelly panel, AI jobs)",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "AI Model Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "AI Model Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "AI Provider Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "AI Provider Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "AI Writing Assist Used": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "AI Writing Suggestion Applied": {
    category: "AI (shared Shelly panel, AI jobs)",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "API Key Created": {
    category: "Auth & identity",
    apps: ["shellstack", "tides", "turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "API Key Updated": {
    category: "Auth & identity",
    apps: ["shellstack", "tides", "turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "API Request Recorded": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Account Connected": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Account Disconnected": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Add-on Quantity Updated": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client"],
    status: "planned",
  },
  "App Launched": {
    category: "Cross-app navigation",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Approval Requested": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Approval Resolved": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Assignment Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Assignment Created Blocked Credits": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client"],
    status: "deprecated",
  },
  "Assistant Appearance Changed": {
    category: "Shelly — AI workforce",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Attachment Updated": {
    category: "Cross-app & generic events",
    apps: ["tides", "kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Billable Report Exported": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "deprecated",
  },
  "Billing Cycle Updated": {
    category: "Cross-app & generic events",
    apps: ["shellstack"],
    source: ["client"],
    status: "planned",
  },
  "Budget Exceeded": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Budget Hours Updated": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "Category Created": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Category Updated": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Chat Action Decided": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Chat Actions Approved All": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client"],
    status: "implemented",
  },
  "Chat Attachment Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client"],
    status: "implemented",
  },
  "Chat Message Failed": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client"],
    status: "implemented",
  },
  "Chat Message Retried": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client"],
    status: "implemented",
  },
  "Chat Message Sent": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Chat Research Enabled": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client"],
    status: "implemented",
  },
  "Chat Session Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Chat Session Deleted": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Chat Work Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client"],
    status: "implemented",
  },
  "Checkout Started": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client"],
    status: "planned",
  },
  "Client Created": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Client Error": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Client Updated": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Collaboration Session Started": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Command Palette Action": {
    category: "Cross-app navigation",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Comment Created": {
    category: "Cross-app & generic events",
    apps: ["tides", "kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Comment Updated": {
    category: "Cross-app & generic events",
    apps: ["tides", "kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Credential Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Credential Tested": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Credential Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Credit Pack Purchased": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Credits Purchase Started": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client"],
    status: "planned",
  },
  "Credits Purchased": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Credits Recorded": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Crew Client Access Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client"],
    status: "implemented",
  },
  "Crew Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Crew Integration Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client"],
    status: "implemented",
  },
  "Crew MCP Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Crew Paused": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Crew Resumed": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Crew Skill Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Crew Tool Policy Saved": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Crew Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Cross-App Switch": {
    category: "Cross-app navigation",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Deep Research Toggled": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Deep Search Cancelled": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Deep Search Run": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Deployment Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Deployment Run Now": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Deployment Triggered": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Deployment Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Deployment Webhook Received": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Document Autosaved": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Document Created": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Document Edited": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Document Exported": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Document Grant Updated": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Document Markdown Imported": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Document Opened": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Document Presence Seen": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Document Resource Updated": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Document Updated": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Editor Block Inserted": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Email Sent": {
    category: "Notifications",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Email Verified": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Expense Created": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Expense Updated": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Filter Updated": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Flow Created": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Flow Draft Generated": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Flow Saved": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Flow Task Linked": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Folder Exported": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "deprecated",
  },
  "Forecast Preview Generated": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "Gate Decided": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Gate Expired": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Icon Picker Tab Changed": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Icon Selected": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Integration Binding Saved": {
    category: "Integrations, bridge & webhooks",
    apps: ["turtletime", "tides", "kraken", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Integration Connect Failed": {
    category: "Integrations, bridge & webhooks",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Integration Connect Started": {
    category: "Integrations, bridge & webhooks",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Integration Connected": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Integration Disconnected": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Integration Rule Created": {
    category: "Integrations, bridge & webhooks",
    apps: ["turtletime", "tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Integration Rule Updated": {
    category: "Integrations, bridge & webhooks",
    apps: ["turtletime", "tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Integration Selected": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "deprecated",
  },
  "Integration Sync Run": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Integration Webhook Received": {
    category: "Integrations, bridge & webhooks",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Integration Workspace Scope Updated": {
    category: "Integrations, bridge & webhooks",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Invite Accepted": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Invite Revoked": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Invoice Created": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Invoice Emailed": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "Invoice Sent": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "Invoice Updated": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Link Copied": {
    category: "Cross-app & generic events",
    apps: ["shellstack", "turtletime", "tides", "kraken", "shelly"],
    source: ["client"],
    status: "implemented",
  },
  "Login Failed": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Login Provider Started": {
    category: "ShellStack portal",
    apps: ["shellstack"],
    source: ["client"],
    status: "deprecated",
  },
  "MCP Server Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "MCP Server Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Mattermost Connect Completed": {
    category: "ShellStack portal",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "deprecated",
  },
  "Mattermost Connect Started": {
    category: "Integrations, bridge & webhooks",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "deprecated",
  },
  "Member Invited": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Member Updated": {
    category: "Organisation, workspace & membership",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Memory Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Memory Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Mention Inserted": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Notification Dispatched": {
    category: "Notifications",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Notification Opened": {
    category: "Notifications",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Notification Read": {
    category: "Notifications",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "OAuth Login Started": {
    category: "Auth & identity",
    apps: ["shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Organisation Created": {
    category: "Organisation, workspace & membership",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Organisation SSO Updated": {
    category: "Organisation, workspace & membership",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Organisation Switched": {
    category: "Organisation, workspace & membership",
    apps: ["shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Organisation Updated": {
    category: "Organisation, workspace & membership",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Page Link Inserted": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Password Reset Completed": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Password Reset Requested": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Password Updated": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Plan Selected": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Plan Updated": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Project Created": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Project Updated": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Proposal Applied": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Proposal Generated": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Proposal Rejected": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Public Share Toggled": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Push Notifications Configured": {
    category: "Notifications",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Report CSV Downloaded": {
    category: "ShellStack portal",
    apps: ["shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Report CSV Previewed": {
    category: "ShellStack portal",
    apps: ["shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Report Exported": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "deprecated",
  },
  "Research Answer Feedback": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Research Answer Regenerated": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Research Answer Saved as Document": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Research Chat Opened": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Research Job Created": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "deprecated",
  },
  "Research Model Selected": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Research Model Updated": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Research Session Cleared": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Retainer Updated": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "Revision Restored": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Run Cancelled": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Run Completed": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Run Failed": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Run Report Acknowledged": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Run Retried": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Run Started": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Scheduled Task Ran": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Search Performed": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Seats Updated": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client"],
    status: "planned",
  },
  "Session Expired": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Skill Created": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Skill Online Imported": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Skill Updated": {
    category: "Shelly — AI workforce",
    apps: ["shelly"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Subscription Cancelled": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Subscription Started": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Subscription Synced": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Subscription Updated": {
    category: "Billing & subscription",
    apps: ["shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Subtask Created": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Subtask Updated": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Tab Viewed": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Tag Created": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Tag Updated": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Task Completed": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Task Created": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Task Deleted": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Task Moved": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Task Opened": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client"],
    status: "implemented",
  },
  "Task Relation Created": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Task Relation Updated": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Task Reopened": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Task Reordered": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client"],
    status: "implemented",
  },
  "Task Scheduled": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client"],
    status: "implemented",
  },
  "Task Status Updated": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Task Template Created": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "deprecated",
  },
  "Task Template Updated": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "deprecated",
  },
  "Task Updated": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Theme Updated": {
    category: "Cross-app navigation",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Tides Task Closed": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "Tides Task Created from Note": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "Tides Task Linked": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "Time Entry Logged": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Time Entry Updated": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Time Logged": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Timer Resumed from Entry": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "Timer Started": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Timer Stopped": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Timesheet Approved": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Timesheet Declined": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Timesheet Submitted": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Today Refreshed": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides"],
    source: ["client"],
    status: "implemented",
  },
  "Track Modal Opened": {
    category: "TurtleTime — time tracking",
    apps: ["turtletime"],
    source: ["client"],
    status: "implemented",
  },
  "User Logged In": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "User Logged Out": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "User Signed Up": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Verification Email Resent": {
    category: "Auth & identity",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "View Updated": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides"],
    source: ["client"],
    status: "implemented",
  },
  "Workflow Status Created": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Workflow Status Updated": {
    category: "Tides — project management",
    apps: ["tides"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Workspace Created": {
    category: "Organisation, workspace & membership",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Workspace Deleted": {
    category: "Organisation, workspace & membership",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Workspace Deletion Started": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Workspace Files Attached": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client"],
    status: "implemented",
  },
  "Workspace Indexed for Search": {
    category: "Kraken — documents & deep search",
    apps: ["kraken"],
    source: ["client", "server"],
    status: "implemented",
  },
  "Workspace Provisioned": {
    category: "Server-only lifecycle & background",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["server"],
    status: "implemented",
  },
  "Workspace Switched": {
    category: "Organisation, workspace & membership",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client"],
    status: "implemented",
  },
  "Workspace Updated": {
    category: "Cross-app & generic events",
    apps: ["turtletime", "tides", "kraken", "shelly", "shellstack"],
    source: ["client", "server"],
    status: "implemented",
  },
};
