import React, { FC, KeyboardEventHandler, useState } from "react";
import { MessageBox } from "react-chat-elements";
import CloseIcon from "@mui/icons-material/Close";
import "react-chat-elements/dist/main.css";
import {
  AppBar,
  Avatar,
  Box,
  LinearProgress,
  Paper,
  Stack,
  IconButton,
  TextareaAutosize,
  Toolbar,
  Typography,
  CircularProgress,
} from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import SendIcon from "@mui/icons-material/Send";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import { useForm } from "react-hook-form";
import { chatWithOpenAI, OpenAIResponse } from "@helpers";
import { useSpeechRecognition, useSpeechSynthesis } from "react-speech-kit";

type Message = {
  position: "left" | "right";
  type: "text" | "photo" | "video" | "audio" | "file";
  text: string;
  dateString: string;
};

export type ChatFormValues = {
  message: string;
};

const createMarkup = (text: string) => {
  const htmlString = text.replace(/\n/g, "<br/>");
  return { __html: htmlString };
};

export const Chat: FC<{
  onCloseButtonClick: () => void;
  fullWidth?: boolean;
}> = ({ onCloseButtonClick, fullWidth, ...rest }) => {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const { handleSubmit, setValue, reset, register } = useForm<ChatFormValues>();

  const onSubmit = ({ message }: ChatFormValues) => {
    setMessages((prevState) => [
      ...prevState,
      {
        position: "right",
        type: "text",
        text: message,
        dateString: new Date().toLocaleTimeString(),
      },
    ]);

    reset();

    setIsTyping(true);
    chatWithOpenAI({ prompt: message })
      .then((result: { data: OpenAIResponse }) => {
        setMessages((prevState) => [
          ...prevState,
          {
            position: "left",
            type: "text",
            text: result.data.reply,
            dateString: new Date().toLocaleTimeString(),
          },
        ]);
      })
      .catch((error: any) => {
        console.error("Failed to get a response from OpenAI", error);
      })
      .finally(() => {
        setIsTyping(false);
      });

    console.log(message);
  };

  const handleButtonClick = (text: string) => {
    alert(`Button clicked for message: ${text}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const lang = "uk-EN";

  const { speak } = useSpeechSynthesis();

  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setValue("message", result);
    },
    lang,
  });

  return (
    <Stack
      direction="column"
      maxWidth={fullWidth ? "100%" : 300}
      component={Paper}
      elevation={6}
      spacing={2}
      sx={{
        backgroundColor: "#F5F9FD",
        position: fullWidth ? "fixed" : "relative",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
      height={fullWidth ? "100%" : 500}
      {...rest}
    >
      <Box width="100%">
        <Stack
          direction="row"
          width="100%"
          justifyContent="flex-end"
          component={AppBar}
          sx={{
            justifyContent: "stretch",
          }}
          position="static"
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {fullWidth && (
              <IconButton
                onClick={onCloseButtonClick}
                sx={{
                  marginRight: "auto",
                }}
              >
                <ArrowBackIcon
                  sx={{
                    color: "#fff",
                  }}
                />
              </IconButton>
            )}

            <Stack direction="row" width="100%" spacing={1}>
              <div>
                <Avatar
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb5mTYXD2gv9hkFvxj81DYRX8UXdD_M7DQqlxniYzG8Q&s"
                  alt="AI avatar"
                />
              </div>

              <Stack direction="column" spacing={1}>
                <Typography>First lesson</Typography>

                <LinearProgress
                  variant="determinate"
                  value={20}
                  sx={{
                    height: "6px",
                  }}
                />
              </Stack>
            </Stack>

            {!fullWidth && (
              <IconButton
                onClick={onCloseButtonClick}
                sx={{
                  marginLeft: "auto",
                }}
              >
                <CloseIcon
                  sx={{
                    color: "#fff",
                  }}
                />
              </IconButton>
            )}
          </Toolbar>
        </Stack>
      </Box>

      <Stack
        direction="column"
        spacing={2}
        justifyContent="space-between"
        flexGrow={1}
        overflow="auto"
      >
        <Box padding=" 0 10px 10px" flexGrow={1}>
          {messages?.map((msg, index) => (
            <Stack
              key={index}
              alignItems="center"
              position="relative"
              justifyContent={
                msg.position === "left" ? "flex-start" : "flex-end"
              }
            >
              <MessageBox
                // @ts-ignore
                position={msg.position}
                type={msg.type}
                styles={{
                  textAlign: "left",
                  maxWidth: "50%",
                }}
                text={<div dangerouslySetInnerHTML={createMarkup(msg.text)} />}
                date={new Date()}
                unread={0}
                dateString={msg.dateString}
              />
              <Stack
                spacing={0.2}
                direction="row"
                position="absolute"
                sx={{
                  [msg.position]: 25,
                  bottom: 5,
                }}
              >
                <IconButton
                  sx={{
                    minWidth: 30,
                  }}
                  onClick={() => speak({ text: msg.text })}
                >
                  <PlayCircleIcon />
                </IconButton>

                <IconButton
                  sx={{
                    minWidth: 30,
                  }}
                  onClick={() => handleButtonClick(msg.text)}
                >
                  <TranslateIcon />
                </IconButton>
              </Stack>
            </Stack>
          ))}

          {isTyping && (
            <Box display="flex" alignItems="center" mt={2}>
              <Typography style={{ marginLeft: 10 }}>Is typing...</Typography>
            </Box>
          )}
        </Box>

        <Box
          position="sticky"
          component="form"
          bottom={0}
          onSubmit={handleSubmit(onSubmit)}
          left={0}
          right={0}
          marginTop="auto"
          sx={{
            display: "flex",
            alignItems: "center",
            background: "#1F8DFB",
            padding: "10px",
          }}
        >
          <TextareaAutosize
            minRows={3}
            maxRows={6}
            style={{
              width: "100%",
              padding: 8,
              marginRight: "6px",
              resize: "none",
            }}
            placeholder="Type your message..."
            onKeyDown={handleKeyDown}
            {...register("message")}
          />

          {listening ? (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "red",
              }}
              onClick={stop}
            />
          ) : (
            <IconButton
              onClick={listen}
              sx={{
                minWidth: 30,
              }}
            >
              <KeyboardVoiceIcon
                sx={{
                  color: "#fff",
                }}
              />
            </IconButton>
          )}

          <IconButton
            type="submit"
            sx={{
              minWidth: 30,
            }}
          >
            <SendIcon
              sx={{
                color: "#fff",
              }}
            />
          </IconButton>
        </Box>
      </Stack>
    </Stack>
  );
};
