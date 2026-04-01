import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Lead, LeadStatus, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_TAG_LABELS, LEAD_ORIGIN_LABELS, PIPELINE_ORDER } from '@/types/leads';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Phone, Building2 } from 'lucide-react';

interface Props {
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onSelectLead: (lead: Lead) => void;
}

const KANBAN_STATUSES = PIPELINE_ORDER;

export default function LeadKanban({ leads, onStatusChange, onSelectLead }: Props) {
  const columns = KANBAN_STATUSES.map(status => ({
    status,
    label: LEAD_STATUS_LABELS[status],
    items: leads.filter(l => l.status === status),
  }));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as LeadStatus;
    const leadId = result.draggableId;
    if (leads.find(l => l.id === leadId)?.status !== newStatus) {
      onStatusChange(leadId, newStatus);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
        {columns.map(col => (
          <Droppable key={col.status} droppableId={col.status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "flex-shrink-0 w-64 rounded-lg border bg-muted/30 flex flex-col",
                  snapshot.isDraggingOver && "bg-primary/5 border-primary/30"
                )}
              >
                <div className="p-3 border-b flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.label}</h3>
                  <Badge variant="secondary" className="text-xs">{col.items.length}</Badge>
                </div>
                <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(70vh-60px)]">
                  {col.items.map((lead, idx) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          onClick={() => onSelectLead(lead)}
                          className={cn(
                            "rounded-md border bg-card p-3 cursor-pointer hover:shadow-md transition-shadow text-sm space-y-1.5",
                            snap.isDragging && "shadow-lg ring-2 ring-primary/20"
                          )}
                        >
                          <p className="font-medium truncate">{lead.name}</p>
                          {lead.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />{lead.company}
                            </p>
                          )}
                          {lead.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />{lead.phone}
                            </p>
                          )}
                          <div className="flex gap-1 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{LEAD_ORIGIN_LABELS[lead.origin]}</span>
                            {lead.tag && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent">{LEAD_TAG_LABELS[lead.tag]}</span>
                            )}
                          </div>
                          {lead.proposalValue > 0 && (
                            <p className="text-xs font-semibold text-primary">
                              R$ {lead.proposalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
