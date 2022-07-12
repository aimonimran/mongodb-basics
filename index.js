const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/playground")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log("Could not connect to MongoDB...", err));

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    require: true,
    enum: ["Web", "Mobile", "Network"],
    trim: true,
  },
  author: String,
  tags: {
    type: Array,
    validate: {
      isAsync: true,
      validator: function (v, callback) {
        setTimeout(() => {
          const result = v && v.length > 0;
          callback(result);
        }, 4000);
      },
      message: "Course tag should have atleast one tag.",
    },
  },
  date: { type: Date, default: Date.now },
  isPublished: Boolean,
  price: {
    type: Number,
    required: function () {
      return this.isPublished;
    },
    min: 10, 
    max: 200,
    get: v => Math.round(v),
    set: v => Math.round(v)
  }
});

const Course = mongoose.model("Course", courseSchema);

async function createCourse() {
  const course = new Course({
    name: "HTML Course",
    category: "Web",
    author: "Mosh",
    tags: ['frontend'],
    isPublished: true,
    price: 32.9,
  });

  try {
    const result = await course.save();
    console.log(result);
  } catch (err) {
    for (field in err.errors) console.log(err.errors[field].message);
  }
}

async function getCourses() {
  const courses = await Course.find({ author: "Mosh", isPublished: true })
    .limit(10)
    .sort({ name: 1 })
    .select({ name: 1, tags: 1 });
  console.log(courses);
}

async function updateCourse(id) {
  const course = await Course.findById(id);
  if (!course) return;

  course.isPublished = true;
  course.author = "Another Author";

  const result = await course.save();
  console.log(result);
}

async function removeCourse(id) {
  const result = await Course.deleteOne({ _id: id });
  console.log(result);
}

createCourse();
