package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/codegangsta/martini"
	"github.com/donovanhide/eventsource"
)

type Comment struct {
	Idx          string
	Author, Text string
}

func (c *Comment) Id() string    { return c.Idx }
func (c *Comment) Event() string { return "comment" }
func (c *Comment) Data() string {
	b, _ := json.Marshal(c)
	return string(b)
}

type IdGenerator struct {
	val int
}

func (idg *IdGenerator) Next() int {
	idg.val += 1
	return idg.val
}

var (
	idx      = IdGenerator{}
	comments = []Comment{
		{strconv.Itoa(idx.Next()), "yml", "Governments **struggle** to control global price of gas"},
		{strconv.Itoa(idx.Next()), "marco", "Tomorrow is _another_ day"},
		{strconv.Itoa(idx.Next()), "martin", "News for news' sake"},
	}
)

// This use slice repository which is fine for this example but if you handle
// a massive volume of events you might want to move to something that will
// not grow in memory without limit.
func newRepo(srv *eventsource.Server) *eventsource.SliceRepository {
	repo := eventsource.NewSliceRepository()
	srv.Register("comments", repo)
	for i := range comments {
		repo.Add("comments", &comments[i])
	}
	return repo
}

func replayLastMessages(n int, srv *eventsource.Server) {
	for {
		for _, cmt := range comments[len(comments)-n:] {
			srv.Publish([]string{"comments"}, &cmt)
		}
		<-time.After(time.Second * 10)
	}
}

func main() {
	srv := eventsource.NewServer()
	defer srv.Close()
	repo := newRepo(srv)
	go replayLastMessages(3, srv)

	m := martini.Classic()

	// Api endpoint that returns a json string with all the comments
	m.Get("/comments", func() string {
		b, _ := json.Marshal(comments)
		return string(b)
	})

	// Api endpoint to create new comments
	m.Post("/comments", func(req *http.Request) string {
		author, text := req.FormValue("author"), req.FormValue("text")
		cmt := &Comment{strconv.Itoa(idx.Next()), author, text}
		repo.Add("comments", cmt)
		srv.Publish([]string{"comments"}, cmt)
		b, _ := json.Marshal(cmt)
		return string(b)
	})

	// eventsource endpoint
	m.Get("/eventsource", srv.Handler("comments"))
	m.Run()
}
