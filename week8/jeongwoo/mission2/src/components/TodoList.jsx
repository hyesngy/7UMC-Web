import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useTodos, useCreateTodo, useUpdateTodo } from '../hooks/useTodoQuery';
import LoadingSpinner from './LoadingSpinner';

const Container = styled.div`
  width: 1920px;
  height: 1261px;
  margin: 0 auto;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 50px;
`;

const Header = styled.div`
  width: 600px;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #212529;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    color: #495057;
  }

  span {
    font-size: 1.2rem;
  }
`;

const ContentContainer = styled.div`
  width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StyledInput = styled.input`
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;

  &::placeholder {
    color: #adb5bd;
  }

  &:focus {
    outline: none;
    border-color: #226844;
  }
`;

const CreateButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: ${props => props.$active ? 'pointer' : 'not-allowed'};
  background-color: ${props => props.$active ? '#226844' : '#e9ecef'};
  color: ${props => props.$active ? 'white' : '#adb5bd'};
  transition: all 0.2s;
  margin: 1rem 0;

  &:hover {
    background-color: ${props => props.$active ? '#1a5235' : '#e9ecef'};
  }
`;

const SearchSection = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const SearchTitle = styled.div`
  padding: 0.5rem 1rem;
  background-color: #e9ecef;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 1rem;
  color: #495057;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const SearchLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchLoadingSpinner = styled(LoadingSpinner)`
  padding: 0.5rem;
`;

const TodoListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const TodoItem = styled.li`
  background: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(5px);
  }
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
`;

const TodoContent = styled.div`
  flex: 1;
`;

const TodoTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #212529;
  text-decoration: ${props => props.$checked ? 'line-through' : 'none'};
`;

const TodoDescription = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #868e96;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  background-color: ${props => props.$variant === 'delete' ? '#dc3545' : '#226844'};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const TodoListComponent = () => {
  const navigate = useNavigate();
  const [newTodo, setNewTodo] = useState({ title: '', content: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const { data: todos = [], isLoading, refetch } = useTodos(debouncedSearchTerm);
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();

  useEffect(() => {
    if (searchTerm !== '') {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 800);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsSearching(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setIsSearching(true);
    }
  }, [debouncedSearchTerm, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
  };

  const handleCreate = async () => {
    if (!newTodo.title.trim() || !newTodo.content.trim()) return;

    try {
      await createMutation.mutateAsync({
        title: newTodo.title,
        content: newTodo.content,
        checked: false
      });
      setNewTodo({ title: '', content: '' });
    } catch (err) {
      console.error('Failed to create todo:', err);
    }
  };

  const handleToggle = async (e, todo) => {
    e.stopPropagation();
    try {
      await updateMutation.mutateAsync({
        id: todo.id,
        checked: !todo.checked
      });
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  };

  const isFormValid = newTodo.title.trim() && newTodo.content.trim();

  return (
    <Container>
      <Header>
        <Title to="/">
          <span>⚡</span>
          UMC ToDoList
          <span>⚡</span>
        </Title>
      </Header>

      <ContentContainer>
        <StyledInput
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          placeholder="제목을 입력해주세요"
        />
        <StyledInput
          value={newTodo.content}
          onChange={(e) => setNewTodo({ ...newTodo, content: e.target.value })}
          placeholder="내용을 입력해주세요"
        />
        
        <CreateButton
          $active={isFormValid}
          disabled={!isFormValid || createMutation.isPending}
          onClick={handleCreate}
        >
          ToDo 생성
        </CreateButton>

        <SearchSection>
          <SearchTitle>검색</SearchTitle>
          <StyledInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="제목으로 검색해보세요."
          />
          {isSearching && (
            <SearchLoadingOverlay>
              <SearchLoadingSpinner text="검색 중..." />
            </SearchLoadingOverlay>
          )}
        </SearchSection>

        {isLoading && !isSearching ? (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        ) : (
          <TodoListContainer>
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                onClick={() => navigate(`/todo/${todo.id}`)}
              >
                <Checkbox
                  type="checkbox"
                  checked={todo.checked}
                  onChange={(e) => handleToggle(e, todo)}
                />
                <TodoContent>
                  <TodoTitle $checked={todo.checked}>{todo.title}</TodoTitle>
                  <TodoDescription>{todo.content}</TodoDescription>
                </TodoContent>
                <ActionButtons>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(e, todo);
                    }}
                  >
                    {todo.checked ? '미완료' : '완료'}
                  </ActionButton>
                  <ActionButton
                    $variant="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/todo/${todo.id}`);
                    }}
                  >
                    수정
                  </ActionButton>
                </ActionButtons>
              </TodoItem>
            ))}
          </TodoListContainer>
        )}
      </ContentContainer>
    </Container>
  );
};

export default TodoListComponent;