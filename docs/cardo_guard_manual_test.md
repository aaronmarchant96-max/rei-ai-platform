# CARDO GUARD Manual Test Script

Use this as a pass/fail check while clicking through the live tool.

## 1. Load State

- Open `CARDO GUARD`.
- Expected:
  - Header shows `PromptHound Labs`.
  - Hero says `Synthetic only`.
  - Tool says `Launch gate`.
  - Default scenario is `Road closure reroute`.

## 2. Draft vs Report

- Change only the slider from `70%` to another value.
- Expected:
  - The input control changes immediately.
  - The report does not change until you click `Run guard check`.

## 3. Run Guard Check

- Click `Run guard check`.
- Expected:
  - The report updates to match the current inputs.
  - Recommendation is shown as `ACT` or `DO NOT ACT`.
  - The hinge sentence matches the numbers shown in the report.

## 4. Scenario Switch

- Change the scenario to `Compressor anomaly`.
- Click `Run guard check`.
- Expected:
  - The scenario title and summary update.
  - Confidence, cost to act, and cost of missing reset to that scenario’s defaults.
  - The recommendation and hinge update accordingly.

## 5. Low-Stakes Scenario

- Switch to `Routine inspection nudge`.
- Click `Run guard check`.
- Expected:
  - The report shows a lower-stakes example.
  - Recommendation should follow the math and may still lean toward `ACT` if the calibrated event likelihood is high enough.
  - The report still explains the tradeoff in plain language.

## 6. Cost Flip

- Keep the same scenario.
- Raise `Cost of missing`.
- Lower `Cost to act`.
- Click `Run guard check`.
- Expected:
  - Recommendation should move toward `ACT`.
  - `Expected miss loss` should become larger than `Expected action waste`.
  - The hinge should say that missing-loss is higher.

## 7. Invalid Input Safety

- Clear `Cost to act` or type an invalid number.
- Click `Run guard check`.
- Expected:
  - The app does not crash.
  - The value falls back safely.
  - The report still renders.

## 8. Reset

- Change the scenario and values.
- Click `Reset synthetic example`.
- Expected:
  - Inputs return to the selected scenario’s defaults.
  - The report updates back to that scenario.

## 9. Boundary Language

- Read the report copy after a few runs.
- Expected:
  - It never claims prediction.
  - It never claims expert replacement.
  - It never sounds like generic AI governance.
  - It keeps saying synthetic / launch gate / decision validator.

## 10. Mobile Check

- Shrink the browser to mobile width.
- Expected:
  - Header still fits.
  - Tabs stack cleanly.
  - Input panel and report stack vertically.
  - Buttons remain usable.

## Pass Rule

- A run passes if the inputs, report, hinge, and recommendation stay aligned, and the copy preserves the synthetic decision-validation boundary.
