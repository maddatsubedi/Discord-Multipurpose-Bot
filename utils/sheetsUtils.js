const { google } = require('googleapis');
const credentials = require('../trape-327504-ce5999dc2d27.json'); // Replace with the path to your credentials file

const { clientId } = require('../config.json');

const SPREADSHEET_ID = '1V6GTNDzoIWG_ELy2Af_KnI5uN63MFXNXuwNZMe4lpUY';

const appendToSheet = async (sheetName, range, data) => {
  const auth = await google.auth.getClient({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [data.split(',.,')],
      },
    });

    // console.log(`${response.data.updates.updatedCells} cells appended.`);
  } catch (error) {
    console.error('The API returned an error:', error);
  }
};

const getSheetData = async (sheetName, range) => {
  const auth = await google.auth.getClient({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
    });

    const rows = response.data.values;
    if (rows.length) {
      return rows.slice(1);
    } else {
      return [];
    }
  } catch (error) {
    console.error('The API returned an error:', error);
    return [];
  }
};

const updateUserData = async (sheetName, userId, reason, count, moderator, moderatorId) => {
  const auth = await google.auth.getClient({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:H`,
    });

    const rows = response.data.values;
    if (rows.length > 1) {
      const rowIndex = rows.findIndex((row) => row[1] === userId);
      if (rowIndex > 0) {
        const date = new Date().toUTCString();
        rows[rowIndex][2] = moderator; // Update the 'Moderator' column
        rows[rowIndex][3] = moderatorId; // Update the 'Moderator' column
        rows[rowIndex][4] = reason; // Update the 'Reason' column
        rows[rowIndex][5] = count; // Update the 'Count' column
        rows[rowIndex][6] = date; // Update the 'Date' column
        
        const updateResponse = await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A${rowIndex + 1}:H${rowIndex + 1}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [rows[rowIndex]],
          },
        });

        // console.log(`${updateResponse.data.updatedCells} cells updated.`);
      } else {
        console.log('User not found.');
      }
    } else {
      console.log('No data found.');
    }
  } catch (error) {
    console.error('The API returned an error:', error);
  }
};

module.exports = { appendToSheet, getSheetData, updateUserData };