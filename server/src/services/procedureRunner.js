import pool from '../config/db.js';
import {
  executeFallbackProcedure,
  executeFallbackProcedureWithOut,
} from './procedureFallback.js';

let dbOfflineLogged = false;

function isConnectionError(err) {
  const code = err?.code || '';
  const msg = String(err?.message || '');
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'PROTOCOL_CONNECTION_LOST' ||
    code === 'ER_ACCESS_DENIED_ERROR' ||
    msg.includes('ECONNREFUSED') ||
    (Array.isArray(err?.errors) && err.errors.some((e) => e?.code === 'ECONNREFUSED'))
  );
}

// Executes a stored procedure and returns the first result set.
// The procedure name is always a static whitelisted constant from this codebase.
export async function callProcedure(procedureName, inParams = []) {
  try {
    const placeholders = inParams.map(() => '?').join(', ');
    const sql = `CALL ${procedureName}${placeholders ? `(${placeholders})` : ''}`;
    const [resultSets] = await pool.query(sql, inParams);
    return resultSets;
  } catch (error) {
    if (isConnectionError(error)) {
      if (!dbOfflineLogged) {
        // eslint-disable-next-line no-console
        console.warn('[Database Notice] MySQL is unreachable. Operating with synchronized in-memory seed data.');
        dbOfflineLogged = true;
      }
      return executeFallbackProcedure(procedureName, inParams);
    }
    throw error;
  }
}

// Executes a stored procedure that exposes OUT parameters, returning a flat
// object keyed by the requested output names.
export async function callProcedureWithOut(procedureName, inParams, outNames) {
  try {
    const inPlaceholders = inParams.map(() => '?').join(', ');
    const outParams = outNames.map((name) => `@${name}`);
    const callArgs = [...inPlaceholders, ...outParams].filter(Boolean).join(', ');

    await pool.query(
      `CALL ${procedureName}${callArgs ? `(${callArgs})` : ''}`,
      inParams
    );

    const [outRows] = await pool.query(
      `SELECT ${outNames.map((name) => `@${name} AS \`${name}\``).join(', ')}`
    );

    return outRows[0];
  } catch (error) {
    if (isConnectionError(error)) {
      if (!dbOfflineLogged) {
        // eslint-disable-next-line no-console
        console.warn('[Database Notice] MySQL is unreachable. Operating with synchronized in-memory seed data.');
        dbOfflineLogged = true;
      }
      return executeFallbackProcedureWithOut(procedureName, inParams, outNames);
    }
    throw error;
  }
}