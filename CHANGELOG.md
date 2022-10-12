## v8.8.1 (2022-10-12)
## Changes
- Added assign to a user for each alert
- Added change severity for alerts (Remember that changing the severity of an alert to ok/cleared doesn't mean that is acked.)
- Added ticket  button creation on the alert
- Added multiple column sorting
- Added notes to multiple alerts
- Added requirement for a note when acknowledge is set
- Added auto-ack for the source alert
- Change the bulk top bar for a sidebar
- Added feedback notification when an action is executed (i.e create a note, acknowledge and alert, etc ... )
- Change the alert detail interface 
- Change the position for the delete button for alert details
- Change the way the notes are viewed/created


## v8.4.0 (2021-01-05)

### Fix

- cancel timer and refresh alerts when env tab changes (#439)
- axios method type no longer string (#437)

### Refactor

- alert detail navigation was confusing (#438)

### Perf

- only keep alive 1 environment tab (#433)
- lazy load alert details and indicators components, again (#432)
- lazy load alert details and indicators components (#431)
- conditionally render environment tab contents (#430)

## v8.3.3 (2021-01-02)

### Fix

- use better link color for dark mode (#422)

### Feat

- add icon in alert summary if note added to alert (#428)
- blackout service drop-down and new values (#425)

## 8.3.2 (2020-12-13)

### Fix

- add helpful error message if susupected CORS issue (#420)

## 8.3.1 (2020-12-12)

### Fix

- add helpful error message if susupected CORS issue (#419)

## v8.3.0 (2020-12-12)

### Fix

- add default empty queries to preferences
- render clickable custom attribute if value an object/array (#415)
- don't keep adding the same search if pinned (#414)
- profile me button when customer views disabled
- custom attribute rendering in alert details
- **ui**: rawData lines should be single spaced

### Feat

- **pref**: always show allowed environments (#417)
- add "X-Request-ID" for tracing (#416)
- **search**: save searches to user preferences (#412)
- make some alert details clickable for query search (#411)
