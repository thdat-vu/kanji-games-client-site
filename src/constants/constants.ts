export const TIMER_SECONDS = 30;

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type JLPTLevel = (typeof JLPT_LEVELS)[number];

export const LEVEL_COLORS: Record<JLPTLevel, string> = {
  N5: "bg-amber-700 text-white",
  N4: "bg-amber-600 text-white",
  N3: "bg-amber-500 text-white",
  N2: "bg-stone-600 text-white",
  N1: "bg-stone-800 text-white",
};

export const LEVEL_POSITIONS = [
  "col-start-1 row-start-3",
  "col-start-3 row-start-3",
  "col-start-2 row-start-2",
  "col-start-1 row-start-1",
  "col-start-3 row-start-1",
] as const;

export const LABELS = {
  KANJI_BADGE: "漢字",
  SELECT_KANJI: "Chọn chữ Kanji",
  SELECT_OTHER: "← Chọn chữ khác",
  ANSWER_PLACEHOLDER: "Nhập nghĩa tiếng Việt...",
  SUBMIT: "Trả lời",
  BACK: "Quay lại",
  RETRY: "Chơi lại",
  LOADING: "Đang tải...",
  NOT_FOUND: "Không tìm thấy từ này trong dữ liệu.",
  CORRECT_ANSWER: "Đáp án đúng",
  YOUR_ANSWER: "Câu trả lời của bạn",
  RESULT_CORRECT: "Chính xác!",
  RESULT_CORRECT_SUB: "Bạn giỏi lắm, tiếp tục nhé!",
  RESULT_WRONG: "Sai rồi!",
  RESULT_WRONG_SUB: "Đừng nản, thử lại nhé!",
  RESULT_TIMEOUT: "Hết giờ!",
  RESULT_TIMEOUT_SUB: "Bạn chưa kịp trả lời.",
} as const;
