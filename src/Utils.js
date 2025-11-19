// src/utils.js

export function createPageUrl(pageName) {
  switch (pageName.toLowerCase()) {
    case "dashboard":
      return "/";
    case "mealplanner":
      return "/meal-planner";
    case "foodlog":
      return "/food-log";
    case "progress":
      return "/progress";
    case "profile":
      return "/profile";
    default:
      return "/";
  }
}
