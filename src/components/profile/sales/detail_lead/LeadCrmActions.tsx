"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar02Icon,
  FileAttachmentIcon,
  MessageEditIcon,
} from "@hugeicons/core-free-icons";
import { div } from "framer-motion/client";
import RegisterActivityModal from "../RegisterActivityModal";
import { useState } from "react";

const buttonClassName =
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-orange-500";

export interface LeadCrmActionsProps {
  leadId: string;
  userId: string;
}

export default function LeadCrmActions({
  leadId,
  userId,
}: LeadCrmActionsProps) {

  const [activityModalOpen, setActivityModalOpen] = useState(false);


  const handleNewProposal = () => {
    // TODO: open modal or route to create TechProposal for this lead
  };
  const handleNewActivity = () => {
    setActivityModalOpen(true);
  };
  const handleNewFollowUp = () => {
    // TODO: open modal or route to create TechFollowUpTask for this lead
  };

  return (
    <div className="flex flex-col gap-4">
    <div className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-3">
        Acciones CRM
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleNewProposal}
          className={buttonClassName}
        >
          <HugeiconsIcon icon={FileAttachmentIcon} size={16} className="text-orange-500" />
          Enviar propuesta
        </button>
        <button
          type="button"
          onClick={handleNewActivity}
          className={buttonClassName}
        >
          <HugeiconsIcon icon={MessageEditIcon} size={16} className="text-orange-500" />
          Registrar actividad
        </button>
        <button
          type="button"
          onClick={handleNewFollowUp}
          className={buttonClassName}
        >
          <HugeiconsIcon icon={Calendar02Icon} size={16} className="text-orange-500" />
          Programar seguimiento
        </button>
      </div>
    </div>
      <RegisterActivityModal
      isOpen={activityModalOpen}
      onClose={() => setActivityModalOpen(false)}
      leadId={leadId}
      userId={userId}
    />
    </div>
  );
}
