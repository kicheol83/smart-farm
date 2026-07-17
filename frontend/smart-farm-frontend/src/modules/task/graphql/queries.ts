import { gql } from "@apollo/client";

export const GET_TASK_BOARD_OVERVIEW = gql`
  query TaskBoardOverview($greenHousesId: ID!) {
    taskBoardOverview(greenHousesId: $greenHousesId) {
      greenHouseId
      totalTasks
      completedTasks
      inProgressTasks
      overdueTasks
      columns {
        status
        count
        tasks {
          _id
          taskTitle
          taskDescription
          taskStatus
          taskPriority
          dueDate
        }
      }
    }
  }
`;

export const GET_TASK_LIST = gql`
  query TaskList($input: GetTasksInput!) {
    taskList(input: $input) {
      items {
        _id
        taskTitle
        taskDescription
        taskStatus
        taskPriority
        dueDate
      }
      total
      page
      totalPages
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      _id
      taskTitle
      taskStatus
    }
  }
`;

export const MOVE_TASK_MUTATION = gql`
  mutation MoveTask($input: MoveTaskInput!) {
    moveTask(input: $input) {
      _id
      taskStatus
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;
