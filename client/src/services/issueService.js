import { apiGet, apiPost, apiPut } from './apiClient.js';

export function createIssue(issueData) {
  return apiPost('/issues', issueData);
}

export function fetchIssues(params = {}) {
  return apiGet('/issues', params);
}

export function updateIssueStatus(issueId, status, resolutionNotes = null) {
  return apiPut(`/issues/${issueId}/status`, { status, resolutionNotes });
}
