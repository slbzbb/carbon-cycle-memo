# Carbon Cycle Memo V2 Architecture

## Branch Strategy

- main
  - Stable production version
  - Current baseline: v2.3.1

- develop
  - V2 development integration branch

- feature/*
  - Feature-specific development branches


## Directory Structure

### src/app

Application-level configuration and initialization.

Examples:

- config.js
- app.js
- router.js


### src/features/dashboard

Dashboard display and daily summary.


### src/features/meals

Meal record management.

Responsibilities:

- create meal
- edit meal
- delete meal
- calculate daily meal totals
- render meal records


### src/features/nutrition

Nutrition calculations.

Responsibilities:

- BMR
- TDEE
- Calories
- Protein / Carbohydrate / Fat
- Nutrition Engine


### src/features/carb-cycle

Carb cycling logic.

Responsibilities:

- High Carb
- Medium Carb
- Low Carb
- Monthly carb cycle plans


### src/features/calendar

Calendar display and date selection.


### src/features/weight

Weight records and weight trend calculations.


### src/features/analytics

Weekly and monthly statistics.


### src/features/ai-food

AI food recognition.

Responsibilities:

- AI request
- food parsing
- structured response validation
- AI error handling


### src/features/settings

User profile and application settings.


### src/storage

Data persistence.

Responsibilities:

- localStorage access
- backup
- restore
- future migration


### src/shared

Reusable common utilities.

Examples:

- constants
- date utilities
- number utilities
- validators


### styles

Modular CSS files.

Future structure:

- base.css
- layout.css
- components.css
- dashboard.css
- records.css
- calendar.css
- profile.css
- modal.css
- responsive.css


## Refactoring Rule

V2 refactoring follows this principle:

1. Preserve existing behavior.
2. Move logic into modules.
3. Test after each migration.
4. Add new functionality only after the existing system is stable.
5. AI features must not directly modify user records without confirmation.
