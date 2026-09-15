/**
 * Field-specific school media map.
 *
 * Every entry points at a purposeful, verified Indian-school photograph built by
 * `scripts/fetch-school-assets.mjs` (AVIF/WebP/JPEG at 640/1280/1920). Licences
 * and attribution live in `src/assets/sources.json`.
 *
 * Rules this map exists to enforce:
 *  - no American/European university imagery, no Western corporate stock
 *  - no unrelated filler (a concert was previously the "auditorium")
 *  - no single image reused as a universal placeholder across sections
 */

const BASE = "/assets/school";

export const SCHOOL = {
  campus: {
    /** Modern Indian campus with the school assembled in the forecourt. */
    hero: `${BASE}/campus/hero.jpg`,
    /** Indian school building with lawns (licensed stock, not our campus). */
    wide: `${BASE}/campus/wide.jpg`,
    /** Brick-and-stone Indian school block. */
    dusk: `${BASE}/campus/dusk.jpg`,
    /** School portico with buses drawn up. */
    entrance: `${BASE}/campus/entrance.jpg`,
    /** Aerial of an Indian campus and its fleet. */
    aerial: `${BASE}/campus/aerial.jpg`,
  },
  students: `${BASE}/students/portrait.jpg`,
  studentsClassroom: `${BASE}/students/classroom.jpg`,
  studentsGroup: `${BASE}/students/group.jpg`,
  studentsUniform: `${BASE}/students/uniform.jpg`,
  books: `${BASE}/students/books.jpg`,
  teachers: `${BASE}/teachers/faculty.jpg`,
  classrooms: `${BASE}/classrooms/digital.jpg`,
  classroomsLesson: `${BASE}/classrooms/lesson.jpg`,
  library: `${BASE}/library/reading.jpg`,
  scienceLab: `${BASE}/science-lab/bench.jpg`,
  computerLab: `${BASE}/computer-lab/lab.jpg`,
  auditorium: `${BASE}/auditorium/hall.jpg`,
  sports: `${BASE}/sports/field.jpg`,
  sportsAthletics: `${BASE}/sports/athletics.jpg`,
  /** Section-exact sport imagery — football, basketball and athletics must not
   *  share one photograph, which is what made the Sports page read as filler. */
  sportsFootball: `${BASE}/sports/football.jpg`,
  sportsBasketball: `${BASE}/sports/basketball.jpg`,
  transport: `${BASE}/transport/bus.jpg`,
  transportFleet: `${BASE}/transport/fleet.jpg`,
  events: `${BASE}/events/assembly.jpg`,
  eventsYoga: `${BASE}/events/yoga.jpg`,
  /** Chau dance performed by students — the cultural programme, not a stock stage. */
  eventsCultural: `${BASE}/events/cultural.jpg`,
  parents: `${BASE}/parents/meeting.jpg`,
  admissions: `${BASE}/admissions/desk.jpg`,
  achievements: `${BASE}/achievements/boards.jpg`,
  leadership: `${BASE}/leadership/principal.jpg`,
  studentLife: `${BASE}/student-life/campus.jpg`,
  studentLifeFriends: `${BASE}/student-life/friends.jpg`,
  /** Portrait master, cropped 4:5 so faces survive the card frame. */
  dashboardPromo: `${BASE}/dashboard/promo.jpg`,
  /** Panoramic master (40:9) so the welcome band crops without slicing subjects. */
  dashboardHero: `${BASE}/dashboard/hero.jpg`,
} as const;

/**
 * Named fields for the public site and the website-content module.
 * Each field is deliberately distinct — see the "no universal filler" rule above.
 */
export const SITE_MEDIA = {
  // campus.wide shows the photographed school's own name board; campus.hero is
  // an aerial with no legible signage and the highest punch score in the set.
  heroImage: SCHOOL.campus.hero,
  heroVideoPoster: SCHOOL.campus.hero,
  aboutImage: SCHOOL.campus.dusk,
  principalImage: SCHOOL.leadership,
  visionImage: SCHOOL.studentsGroup,
  campusImage: SCHOOL.campus.aerial,
  campusDuskImage: SCHOOL.campus.dusk,
  academicImage: SCHOOL.classroomsLesson,
  earlyYearsImage: SCHOOL.studentsGroup,
  primaryImage: SCHOOL.classrooms,
  middleImage: SCHOOL.books,
  secondaryImage: SCHOOL.achievements,
  seniorImage: SCHOOL.studentsUniform,
  libraryImage: SCHOOL.library,
  laboratoryImage: SCHOOL.scienceLab,
  computerLabImage: SCHOOL.computerLab,
  auditoriumImage: SCHOOL.auditorium,
  sportsImage: SCHOOL.sports,
  athleticsImage: SCHOOL.sportsAthletics,
  studentLifeImage: SCHOOL.studentLife,
  clubsImage: SCHOOL.studentLifeFriends,
  footballImage: SCHOOL.sportsFootball,
  basketballImage: SCHOOL.sportsBasketball,
  parentsImage: SCHOOL.parents,
  cultureImage: SCHOOL.eventsCultural,
  eventImage: SCHOOL.events,
  assemblyImage: SCHOOL.events,
  yogaImage: SCHOOL.eventsYoga,
  newsImage: SCHOOL.campus.aerial,
  facultyImage: SCHOOL.teachers,
  admissionsImage: SCHOOL.admissions,
  transportImage: SCHOOL.transport,
  galleryCampus: SCHOOL.campus.wide,
  galleryClassroom: SCHOOL.classrooms,
  galleryStudents: SCHOOL.students,
  gallerySports: SCHOOL.sports,
  galleryLibrary: SCHOOL.library,
  galleryLab: SCHOOL.scienceLab,
  galleryLesson: SCHOOL.classroomsLesson,
  galleryEvents: SCHOOL.events,
  galleryFaculty: SCHOOL.teachers,
  galleryArts: SCHOOL.eventsCultural,
  galleryBus: SCHOOL.transportFleet,
  galleryEast: SCHOOL.campus.dusk,
  galleryNoida: SCHOOL.campus.aerial,
  dashboardHero: SCHOOL.dashboardHero,
  dashboardPromo: SCHOOL.dashboardPromo,
} as const;

/**
 * Intentional focal points per use-case. Masters are already cropped to the right
 * aspect by the asset pipeline, so these only nudge the focal point inside it.
 */
export const SCHOOL_CROP = {
  hero: "center 42%",
  campusWide: "center 45%",
  portrait: "center 22%",
  classroom: "center 40%",
  library: "center 45%",
  sports: "center 45%",
  bus: "center 50%",
  dashboardHero: "center 45%",
  dashboardPromo: "center 25%",
  principal: "center 20%",
} as const;

export type SchoolMediaKey = keyof typeof SCHOOL;
export type SiteMediaField = keyof typeof SITE_MEDIA;
