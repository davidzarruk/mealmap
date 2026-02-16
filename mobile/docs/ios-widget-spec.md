# F8-007: iOS Today Widget — Implementation Spec

## Status: Documented (not implementable in Expo managed workflow)

WidgetKit requires native Swift code and an App Extension target, which is **not supported in Expo managed workflow**. This document specifies the implementation plan for when the project ejects to a bare workflow or uses a custom dev client.

## Widget Overview

- **Type:** iOS 14+ WidgetKit (Small + Medium sizes)
- **Content:** Today's meals (title, time, approved status)
- **Update frequency:** Every 30 minutes via `TimelineProvider`
- **Data source:** Shared App Group `UserDefaults`

## Architecture

```
┌──────────────────────┐     ┌──────────────────────┐
│   Main Mealmap App   │────▶│  App Group Storage   │
│  (writes today data) │     │  (UserDefaults)      │
└──────────────────────┘     └──────────┬───────────┘
                                        │
                              ┌─────────▼───────────┐
                              │  MealmapWidget       │
                              │  (WidgetKit ext)     │
                              └─────────────────────┘
```

## Data Contract (App Group UserDefaults)

Key: `com.mealmap.widget.todayMeals`

```json
{
  "date": "2026-02-16",
  "meals": [
    {
      "title": "Quick ajiaco",
      "time": "12:00",
      "approved": true,
      "emoji": "🍲",
      "prepTimeMin": 35
    }
  ],
  "progress": {
    "approved": 15,
    "total": 21,
    "percent": 71
  }
}
```

## React Native Side

File: `src/lib/widgetBridge.ts`

```typescript
import { NativeModules } from 'react-native';

export async function updateWidgetData(data: WidgetData): Promise<void> {
  // Uses react-native-shared-group-preferences or direct NativeModule
  await NativeModules.SharedGroupPreferences.setItem(
    'todayMeals',
    JSON.stringify(data),
    'group.com.mealmap.app'
  );
  // Trigger widget reload
  await NativeModules.WidgetKitBridge.reloadAllTimelines();
}
```

## Swift Widget Implementation

### File: `MealmapWidget/MealmapWidget.swift`

```swift
import WidgetKit
import SwiftUI

struct MealEntry: TimelineEntry {
    let date: Date
    let meals: [MealItem]
    let progress: ProgressInfo
}

struct MealItem: Codable {
    let title: String
    let time: String
    let approved: Bool
    let emoji: String
    let prepTimeMin: Int
}

struct ProgressInfo: Codable {
    let approved: Int
    let total: Int
    let percent: Int
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> MealEntry {
        MealEntry(date: Date(), meals: [
            MealItem(title: "Loading...", time: "12:00", approved: false, emoji: "🍽️", prepTimeMin: 30)
        ], progress: ProgressInfo(approved: 0, total: 21, percent: 0))
    }

    func getSnapshot(in context: Context, completion: @escaping (MealEntry) -> ()) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<MealEntry>) -> ()) {
        let entry = loadEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadEntry() -> MealEntry {
        guard let defaults = UserDefaults(suiteName: "group.com.mealmap.app"),
              let data = defaults.data(forKey: "todayMeals"),
              let decoded = try? JSONDecoder().decode(WidgetData.self, from: data) else {
            return placeholder(in: .init())
        }
        return MealEntry(date: Date(), meals: decoded.meals, progress: decoded.progress)
    }
}

@main
struct MealmapWidget: Widget {
    let kind: String = "MealmapWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MealmapWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Today's Meals")
        .description("See your planned meals for today.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

## Steps to Implement

1. **Eject from Expo managed** or use `expo prebuild` with config plugins
2. **Add App Group capability** in Xcode for both main app and widget extension
3. **Create Widget Extension target** in Xcode (File → New → Target → Widget Extension)
4. **Install `react-native-shared-group-preferences`** for bridging data
5. **Implement `widgetBridge.ts`** to write data on plan changes
6. **Build and test** on physical device (widgets don't work in simulator for shared data)

## Config Plugin (for expo prebuild)

A custom Expo config plugin could automate steps 2-3:

```javascript
// plugins/withMealmapWidget.js
const { withXcodeProject } = require('@expo/config-plugins');

module.exports = function withMealmapWidget(config) {
  return withXcodeProject(config, async (config) => {
    // Add widget extension target
    // Add app group entitlement
    return config;
  });
};
```

## Dependencies

- `react-native-shared-group-preferences` (npm)
- Native: WidgetKit framework (iOS 14+)
- Xcode 14+ for building

## Timeline

- Estimated effort: 2-3 days after ejecting to bare workflow
- No blocker for MVP — widget is a nice-to-have enhancement
