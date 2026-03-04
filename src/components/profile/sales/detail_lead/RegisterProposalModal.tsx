"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import {
  TECH_PROPOSALS_QUERY,
  TECH_PROPOSALS_COUNT_QUERY,
  CREATE_TECH_PROPOSAL_MUTATION,
  type TechProposalsVariables,
  type TechProposalsResponse,
  type CreateTechProposalVariables,
  type CreateTechProposalMutation,
} from "kadesh/components/profile/sales/queries";
import { PROPOSAL_STATUS } from "kadesh/components/profile/sales/constants";
import { sileo } from "sileo";

const PROPOSAL_STATUS_OPTIONS = Object.values(PROPOSAL_STATUS);

function formatDateShort(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateForInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface RegisterProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  leadId: string;
  userId: string;
}

export default function RegisterProposalModal({
  isOpen,
  onClose,
  onSuccess,
  leadId,
  userId,
}: RegisterProposalModalProps) {
  const [sentDate, setSentDate] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<string>(PROPOSAL_STATUS.ENVIADA);
  const [fileOrUrl, setFileOrUrl] = useState("");

  const proposalsWhere: TechProposalsVariables["where"] = {
    AND: [
      {
        assignedSeller: { id: { equals: userId } },
        businessLead: { id: { equals: leadId } },
      },
    ],
  };

  const { data: proposalsData, loading: proposalsLoading } = useQuery<
    TechProposalsResponse,
    TechProposalsVariables
  >(TECH_PROPOSALS_QUERY, {
    variables: { where: proposalsWhere },
    skip: !isOpen || !leadId || !userId,
    fetchPolicy: "network-only",
  });

  const [createProposal, { loading: submitting }] = useMutation<
    CreateTechProposalMutation,
    CreateTechProposalVariables
  >(CREATE_TECH_PROPOSAL_MUTATION, {
    refetchQueries: [
      { query: TECH_PROPOSALS_QUERY, variables: { where: proposalsWhere } },
      { query: TECH_PROPOSALS_COUNT_QUERY, variables: { where: proposalsWhere } },
    ],
  });

  const proposals = proposalsData?.techProposals ?? [];

  type ProposalItem = (typeof proposals)[number];
  const [selectedProposal, setSelectedProposal] = useState<ProposalItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSentDate(formatDateForInput(new Date().toISOString()));
      setAmount("");
      setStatus(PROPOSAL_STATUS.ENVIADA);
      setFileOrUrl("");
      setSelectedProposal(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      sileo.warning({ title: "Debes iniciar sesión para enviar una propuesta" });
      return;
    }
    if (!fileOrUrl.trim()) {
      sileo.warning({ title: "La URL o referencia al archivo es obligatoria" });
      return;
    }
    const amountNum = amount.trim() ? parseFloat(amount) : null;
    if (amountNum != null && (Number.isNaN(amountNum) || amountNum < 0)) {
      sileo.warning({ title: "El monto debe ser un número válido" });
      return;
    }
    try {
      await createProposal({
        variables: {
          data: {
            sentDate: sentDate || formatDateForInput(new Date().toISOString()),
            amount: amountNum ?? undefined,
            status: status || PROPOSAL_STATUS.ENVIADA,
            fileOrUrl: fileOrUrl.trim(),
            businessLead: { connect: { id: leadId } },
            assignedSeller: { connect: { id: userId } },
          },
        },
      });
      sileo.success({ title: "Propuesta registrada" });
      onSuccess?.();
    } catch {
      sileo.error({
        title: "No se pudo registrar la propuesta",
        description: "Intenta de nuevo más tarde.",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start p-6 pb-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] pr-4">
                  Enviar propuesta
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] transition-colors flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                  disabled={submitting}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="px-6 pb-4 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-2">
                  Propuestas registradas
                </p>
                {proposalsLoading ? (
                  <div className="flex justify-center py-6">
                    <span className="animate-spin size-8 border-2 border-orange-500 border-t-transparent rounded-full" />
                  </div>
                ) : proposals.length === 0 ? (
                  <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-4">
                    Aún no hay propuestas para este lead.
                  </p>
                ) : (
                  <div className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] overflow-hidden">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#f5f5f5] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
                            Fecha envío
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
                            Monto
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
                            Estado
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap max-w-[160px]">
                            URL / archivo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposals.map((p) => (
                          <tr
                            key={p.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedProposal(p)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedProposal(p);
                              }
                            }}
                            className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] hover:bg-[#fafafa] dark:hover:bg-[#252525] cursor-pointer transition-colors"
                          >
                            <td className="px-3 py-2 text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap">
                              {formatDateShort(p.sentDate)}
                            </td>
                            <td className="px-3 py-2 text-[#212121] dark:text-[#ffffff]">
                              {p.amount != null ? `$${Number(p.amount).toLocaleString("es-MX")}` : "—"}
                            </td>
                            <td className="px-3 py-2 text-[#212121] dark:text-[#ffffff]">
                              {p.status}
                            </td>
                            <td className="px-3 py-2 text-[#616161] dark:text-[#b0b0b0] max-w-[160px] truncate" title={p.fileOrUrl ?? undefined}>
                              {p.fileOrUrl ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal detalle de la propuesta */}
              <AnimatePresence>
                {selectedProposal && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
                      onClick={() => setSelectedProposal(null)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
                    >
                      <div
                        className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
                          <h4 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
                            Detalle de propuesta
                          </h4>
                          <button
                            type="button"
                            onClick={() => setSelectedProposal(null)}
                            className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#333]"
                            aria-label="Cerrar"
                          >
                            ×
                          </button>
                        </div>
                        <div className="p-4 overflow-y-auto space-y-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">Fecha envío</p>
                            <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                              {formatDateShort(selectedProposal.sentDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">Monto</p>
                            <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                              {selectedProposal.amount != null
                                ? `$${Number(selectedProposal.amount).toLocaleString("es-MX")}`
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">Estado</p>
                            <p className="text-sm text-[#212121] dark:text-[#ffffff]">{selectedProposal.status}</p>
                          </div>
                          {selectedProposal.businessLead && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">Empresa</p>
                              <p className="text-sm text-[#212121] dark:text-[#ffffff]">{selectedProposal.businessLead.businessName}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">URL</p>
                            <p className="text-sm text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap break-all">
                              {selectedProposal.fileOrUrl ? (
                                <a
                                  href={selectedProposal.fileOrUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-500 hover:underline"
                                >
                                  {selectedProposal.fileOrUrl}
                                </a>
                              ) : (
                                "—"
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">Registrado</p>
                            <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                              {formatDateShort(selectedProposal.createdAt)}
                            </p>
                          </div>
                          {selectedProposal.updatedAt && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-1">Actualizado</p>
                              <p className="text-sm text-[#212121] dark:text-[#ffffff]">
                                {formatDateShort(selectedProposal.updatedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className="border-t border-[#e0e0e0] dark:border-[#3a3a3a] pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0] mb-3 px-6">
                  Nueva propuesta
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="proposal-sentDate"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Fecha envío <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="proposal-sentDate"
                    type="date"
                    required
                    value={sentDate}
                    onChange={(e) => setSentDate(e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="proposal-amount"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Monto
                  </label>
                  <input
                    id="proposal-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="proposal-status"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    Estado
                  </label>
                  <select
                    id="proposal-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {PROPOSAL_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="proposal-fileOrUrl"
                    className="block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
                  >
                    URL o referencia al archivo <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="proposal-fileOrUrl"
                    type="text"
                    required
                    value={fileOrUrl}
                    onChange={(e) => setFileOrUrl(e.target.value)}
                    placeholder="Pega aquí el enlace del doc o de la tarea..."
                    className="w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                   <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-2">
                    Crea el documento (si aún no tienes uno) y pega aquí el enlace.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <a
                      href="https://docs.google.com/document/create"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
                    >
                      Crear documento propuesta
                    </a>
                  </div>
                </div>

                <div className="flex flex-row justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2.5 border-2 border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] font-semibold rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Guardando..." : "Registrar propuesta"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
