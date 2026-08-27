import type { Meta, StoryObj } from "@storybook/react-vite";
import { CourseLessonScreen, starterKataCourseScreen } from "../components/ui/course-lesson-demo";

const meta = {
  title: "Course/Lesson workspace",
  component: CourseLessonScreen,
  args: { model: starterKataCourseScreen, theme: "dark" },
  argTypes: {
    model: { table: { disable: true } },
    theme: { control: "inline-radio", options: ["dark", "light", "inherit"] },
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CourseLessonScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StarterKata: Story = {};

export const LightTheme: Story = { args: { theme: "light" } };
