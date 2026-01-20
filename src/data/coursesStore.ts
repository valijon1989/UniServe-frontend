import {
  educationCourses,
  educationSubCategories,
  type CourseMode,
  type EducationCategory,
  type EducationCourse
} from "@/data/educationCourses";

type CourseFilters = {
  category?: EducationCategory;
  subCategory?: string;
  mode?: CourseMode | "all";
  teachingLanguage?: string;
  scheduleTime?: string;
};

export const listCourses = (filters: CourseFilters = {}) => {
  const { category, subCategory, mode = "all", teachingLanguage, scheduleTime } = filters;
  return educationCourses.filter((course) => {
    if (category && course.category !== category) return false;
    if (subCategory && course.subCategory !== subCategory) return false;
    if (mode !== "all" && course.mode !== mode) return false;
    if (teachingLanguage && course.teachingLanguage !== teachingLanguage) return false;
    if (scheduleTime && course.scheduleTime !== scheduleTime) return false;
    return true;
  });
};

export const getCourseById = (id: string) =>
  educationCourses.find((course) => course.id === id) || null;

export const getDefaultSubCategory = (category: EducationCategory) =>
  educationSubCategories[category]?.[0] || "";
