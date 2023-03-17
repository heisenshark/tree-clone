import { GetServerSideProps } from "next";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/utils/api";

type Inputs = {
  example: string;
  exampleRequired: string;
};

const Add = () => {
  const add = api.example.trees.addOne.useMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    add.mutate({ content: "chuj" });
  };
  return (
    <div>
      <div className="mx-10 mt-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* register your input into the hook by invoking the "register" function */}
          <input
            className="w-full rounded border border-gray-300 bg-white py-1 px-3 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            defaultValue="test"
            {...register("example")}
          />

          {/* include validation with required or other standard HTML validation rules */}
          <input
            className="w-full rounded border border-gray-300 bg-white py-1 px-3 text-base leading-8 text-gray-700 outline-none transition-colors duration-200 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            {...register("exampleRequired", { required: true })}
          />
          {/* errors will return when field validation fails  */}
          {errors.exampleRequired && <span>This field is required</span>}
          <input
            className="inline-flex rounded border-0 bg-indigo-500 py-2 px-6 text-lg text-white hover:bg-indigo-600 focus:outline-none"
            type="submit"
          />
        </form>
      </div>
    </div>
  );
};

export default Add;
