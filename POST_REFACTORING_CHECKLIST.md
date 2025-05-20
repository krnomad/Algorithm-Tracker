# Post-Refactoring Sanity Check - Algorithm Tracker App

This checklist is to quickly verify that the application functions identically after the refactoring (moving components and utility functions).

## 1. Application Startup

| Test Case ID | Description                                      | Steps                                                                 | Expected Result                                  | Actual Result | Status (Pass/Fail) | Notes |
|--------------|--------------------------------------------------|-----------------------------------------------------------------------|--------------------------------------------------|---------------|--------------------|-------|
| START-001    | Application loads without critical console errors. | 1. Open the application in a browser. <br> 2. Open developer console. | App loads. No critical errors in the console.    |               |                    |       |

## 2. Core Functionalities (Smoke Test)

| Test Case ID | Feature             | Action to Test                                                                                                | Expected Result                                                                                                | Actual Result | Status (Pass/Fail) | Notes |
|--------------|---------------------|---------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|---------------|--------------------|-------|
| FUNC-001     | Problem Adding      | Add a new problem with title, URL (valid), difficulty, and tags.                                              | Problem added to list, appears in "Today's Review" (if applicable), success toast.                             |               |                    |       |
| FUNC-002     | Problem Display     | Verify the newly added problem and any existing problems are displayed correctly in lists and on cards.       | Problem details (title, URL, difficulty, tags, review status) are accurate.                                    |               |                    |       |
| FUNC-003     | Review Marking      | Mark a problem as "Success" and another as "Fail".                                                            | Toast notifications appear. Review dates and success rate update.                                                |               |                    |       |
| FUNC-004     | Problem Deletion    | Delete a problem.                                                                                             | Problem removed from lists. Toast notification.                                                                |               |                    |       |
| FUNC-005     | Calendar            | Check if calendar highlights days with reviews. Select a different date.                                      | Markers (●) appear on correct days. Calendar responds to date selection.                                       |               |                    |       |
| FUNC-006     | Filter & Sort       | Apply a tag filter. Apply a title search. Change sort order.                                                  | Problem list updates correctly based on filters and sort order.                                                  |               |                    |       |
| FUNC-007     | Statistics Charts   | View "Problems by Difficulty" and "Problems by Tag" charts.                                                   | Charts display data accurately based on current problems. (If no data, "No data to display" message shown).    |               |                    |       |
| FUNC-008     | Streak Counter      | If applicable (based on today's reviews), check if streak counter is accurate. Mark a problem reviewed today. | Streak counter reflects consecutive review days.                                                                 |               |                    |       |
| FUNC-009     | Export/Import       | Export problems. Delete a problem. Import the previously exported file.                                       | Export creates a JSON file. Import restores problems correctly. Toast notifications for success/failure.         |               |                    |       |

## 3. Console Error Monitoring

| Test Case ID | Description                                            | Steps                                                                                                                                 | Expected Result                                      | Actual Result | Status (Pass/Fail) | Notes |
|--------------|--------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|---------------|--------------------|-------|
| ERR-001      | Monitor console during general usage.                  | 1. Keep developer console open. <br> 2. Perform actions from FUNC-001 to FUNC-009. <br> 3. Click around, interact with various UI elements. | No new JavaScript errors appear in the console.      |               |                    |       |
| ERR-002      | Specifically check for module/import related errors.   | 1. During testing, pay attention to errors like "module not found", "failed to resolve import", or "X is not a function/component".     | No such errors related to the refactored structure.  |               |                    |       |

This checklist provides a focused way to ensure the refactoring process did not introduce regressions. Any "Fail" status should be investigated.
