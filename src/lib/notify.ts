import { supabase } from "@/integrations/supabase/client";

interface NotifyOptions {
  userId: string;
  title: string;
  message: string;
  type?: string;
  metadata?: Record<string, any>;
}

export async function sendNotification({ userId, title, message, type = "order", metadata = {} }: NotifyOptions) {
  await supabase.from("notifications" as any).insert({
    user_id: userId,
    title,
    message,
    type,
    metadata,
  });
}

interface LogOptions {
  actorId?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
}

export async function logActivity({ actorId, actorName, action, entityType, entityId, details = {} }: LogOptions) {
  await supabase.from("activity_logs" as any).insert({
    actor_id: actorId,
    actor_name: actorName,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}
