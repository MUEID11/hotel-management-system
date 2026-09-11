import { callProcedure, callProcedureWithOut } from './procedureRunner.js';

export async function createIssueService({ reservationId, roomId, guestId, category, priority, description }) {
  const result = await callProcedureWithOut(
    'sp_create_room_issue',
    [
      reservationId || null,
      roomId,
      guestId || null,
      category || 'OTHER',
      priority || 'MEDIUM',
      description,
    ],
    ['issue_id']
  );
  return { issueId: Number(result.issue_id) };
}

export async function getIssuesService(reservationId = null) {
  return callProcedure('sp_get_room_issues', [reservationId]);
}

export async function updateIssueStatusService(issueId, status, resolutionNotes = null) {
  await callProcedure('sp_update_room_issue_status', [issueId, status, resolutionNotes]);
}
