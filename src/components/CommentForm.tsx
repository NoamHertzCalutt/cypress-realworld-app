import React, { useState, useEffect } from "react";
import { makeStyles, TextField } from "@material-ui/core";
import { Formik, Form, Field, FieldProps } from "formik";
import { string, object } from "yup";

import Tailorr from "../tailorr-api";
import { useActor } from "@xstate/react";
import { authService } from "../machines/authMachine";

const validationSchema = object({
  content: string(),
});

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
}));

export interface CommentFormProps {
  transactionId: string;
  transactionComment: (payload: object) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ transactionId, transactionComment }) => {
  const classes = useStyles();
  const initialValues = { content: "" };
  const [authState] = useActor(authService);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const tailorrCanUse = async () => {
      if (authState?.context?.user) {
        let canUse = await Tailorr.canUseFeature(
          "comment-and-react",
          authState.context.user.username
        );
        setDisabled(!canUse);
        console.log("Can use comment and react?", canUse);
      }
    };
    tailorrCanUse();
  }, [authState]);

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          Tailorr.reportUse("comment-and-react", authState.context.user?.username, 1);
          setSubmitting(true);
          transactionComment({ transactionId, ...values });
        }}
      >
        {() => (
          <Form className={classes.form}>
            <Field name="content">
              {({ field, meta }: FieldProps) => (
                <TextField
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  id={`transaction-comment-input-${transactionId}`}
                  type="text"
                  placeholder="Write a comment..."
                  inputProps={{ "data-test": `transaction-comment-input-${transactionId}` }}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched ? meta.error : ""}
                  {...field}
                  disabled={disabled}
                />
              )}
            </Field>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CommentForm;
